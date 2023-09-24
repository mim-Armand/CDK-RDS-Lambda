import * as ec2 from '@aws-cdk/aws-ec2'
import * as lambda from '@aws-cdk/aws-lambda'
import { Construct, Duration, Stack } from '@aws-cdk/core'
import { AwsCustomResource, AwsCustomResourcePolicy, AwsSdkCall, PhysicalResourceId } from '@aws-cdk/custom-resources'
import { RetentionDays } from '@aws-cdk/aws-logs'
import { PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { createHash } from 'crypto'

export interface CdkResourceInitializerProps {
    vpc: ec2.IVpc
    subnetsSelection: ec2.SubnetSelection
    fnSecurityGroups: ec2.ISecurityGroup[]
    fnTimeout: Duration
    fnCode: lambda.DockerImageCode
    fnLogRetention: RetentionDays
    fnMemorySize?: number
    config: any
}

export class CdkResourceInitializer extends Construct {
    public readonly response: string
    public readonly customResource: AwsCustomResource
    public readonly function: lambda.Function

    constructor (scope: Construct, id: string, props: CdkResourceInitializerProps) {
        super(scope, id)

        const stack = Stack.of(this);


        // const fnSg = new ec2.SecurityGroup(this, 'ResourceInitializerFnSg', {
        //     securityGroupName: `${id}ResourceInitializerFnSg`,
        //     vpc: props.vpc,
        //     allowAllOutbound: true
        // })

        const fn = new lambda.DockerImageFunction(this, 'ResourceInitializerFn', {
            memorySize: props.fnMemorySize || 128,
            functionName: `${id}-ResInit-${stack.stackName}`,
            code: props.fnCode,
            vpcSubnets: props.vpc.selectSubnets(props.subnetsSelection),
            vpc: props.vpc,
            securityGroups: [
                // fnSg,
                ...props.fnSecurityGroups
            ],
            timeout: props.fnTimeout,
            logRetention: props.fnLogRetention,
            allowAllOutbound: true,
            initialPolicy: [
                new PolicyStatement({
                    actions: ['secretsmanager:GetSecretValue', ],
                    resources: [`arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:${props.config.credsSecretName}-*`],
                }),
                new PolicyStatement({
                    actions: [
                        'rds:DescribeDBInstances',
                        "rds:DescribeDBClusters",
                        'rds-db:connect',
                    ],
                    resources: [
                        // Specify the ARNs of the RDS instances that the function can interact with
                        // `arn:aws:rds:${stack.region}:${stack.account}:db:${props.config.dbInstanceIdentifier}`
                        `arn:aws:rds:*:${stack.account}:db:*`,
                        `arn:aws:rds-db:*:${stack.account}:dbuser:*/*`,
                        '*',
                    ],
                })
            ],
        })

        const payload: string = JSON.stringify({
            params: {
                config: props.config
            }
        })

        const payloadHashPrefix = createHash('md5').update(payload).digest('hex').substring(0, 6)

        const sdkCall: AwsSdkCall = {
            service: 'Lambda',
            action: 'invoke',
            parameters: {
                FunctionName: fn.functionName,
                Payload: payload
            },
            physicalResourceId: PhysicalResourceId.of(`${id}-AwsSdkCall-${fn.currentVersion.version + payloadHashPrefix}`)
        }

        const customResourceFnRole = new Role(this, 'AwsCustomResourceRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com')
        })
        customResourceFnRole.addToPolicy(
            new PolicyStatement({
                resources: [
                    `arn:aws:lambda:${stack.region}:${stack.account}:function:*-ResInit${stack.stackName}`,
                    `arn:aws:lambda:${stack.region}:${stack.account}:function:*`,
                    '*'
                ],
                actions: ['lambda:InvokeFunction']
            })
        )
        this.customResource = new AwsCustomResource(this, 'AwsCustomResource', {
            policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
            onUpdate: sdkCall,
            timeout: Duration.minutes(10),
            role: customResourceFnRole
        })

        this.response = this.customResource.getResponseField('Payload')

        this.function = fn
    }
}
