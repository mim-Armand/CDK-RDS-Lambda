import * as cdk from '@aws-cdk/core'
import { CfnOutput, Duration, Stack, Token } from '@aws-cdk/core'
import { CdkResourceInitializer } from './resource-initializer'
import { DockerImageCode } from '@aws-cdk/aws-lambda'
import { SubnetType, Vpc, SecurityGroup } from '@aws-cdk/aws-ec2'
import { RetentionDays } from '@aws-cdk/aws-logs'
// import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class RdsInitStackExample extends Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, {
            // Retrieve AWS account ID and region from environment variables, or set to default values if not set
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT ?? 'default_account',
                region: process.env.CDK_DEFAULT_REGION ?? 'default_region',
            }, ...props
        })

        const credsSecretName = 'rds-db-secrets';
        const sgid = 'sg-0650075417a79a928'; //todo: update this to the actual value you can also obtain from the RDS stack outputs
        const vpcId = 'vpc-04c1875db33b2f0c4'; //todo: update this to the actual value you can also obtain from the RDS stack outputs

        // const vpcId = cdk.Fn.importValue('AthenaVpcIdOutput'); // these ofcourse are not gonna work! :/
        const vpc = Vpc.fromLookup(this, 'vpc', {vpcId});
        // const sgid = cdk.Fn.importValue('dbSecurityGroupId-2');
        const sg = SecurityGroup.fromSecurityGroupId(this, 'cdk-sg', sgid);


        const initializer = new CdkResourceInitializer(this, 'MyRdsInit', {
            config: {
                credsSecretName
            },
            fnLogRetention: RetentionDays.ONE_DAY,
            fnCode: DockerImageCode.fromImageAsset(`${__dirname}/../demos/rds-init-fn-code`, {}),
            fnTimeout: Duration.minutes(2),
            fnSecurityGroups: [sg],
            vpc,
            subnetsSelection: vpc.selectSubnets({
                subnetType: SubnetType.PRIVATE_WITH_NAT
            }),
        })

        /* eslint no-new: 0 */
        new CfnOutput(this, 'RdsInitFnResponse', {
            value: Token.asString(initializer.response)
        })
    }
}
