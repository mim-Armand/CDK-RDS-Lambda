import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cr from 'aws-cdk-lib/custom-resources';


interface RDSLambdaStackProps extends cdk.StackProps {
  dbInstanceEndpointAddress: string;
  dbInstanceEndpointPort: string;
}

export class CdkRdsPopulateLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RDSLambdaStackProps = {
    dbInstanceEndpointAddress: "",
    dbInstanceEndpointPort: "",
  }) {
    super(scope, id, props);

    const { dbInstanceEndpointAddress, dbInstanceEndpointPort } = props;

    // Reference to the existing secret
    const dbSecret = secretsmanager.Secret.fromSecretNameV2(this, 'DBSecret', 'DBSecret');

    const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      environment: {
        DB_ENDPOINT_ADDRESS: dbInstanceEndpointAddress,
        DB_ENDPOINT_PORT: dbInstanceEndpointPort,
      },
      timeout: cdk.Duration.seconds(333),
    });

    // Grant permissions to the Lambda function to get secrets from Secrets Manager
    dbSecret.grantRead(lambdaFunction);

    // Allow the Lambda function to connect to the RDS instance
    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ["rds-db:connect"],
      resources: ["*"],
    }));

    new cr.AwsCustomResource(this, 'CustomResource', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: lambdaFunction.functionName,
          Payload: JSON.stringify({
            "DB_ENDPOINT_ADDRESS": dbInstanceEndpointAddress,
            "DB_ENDPOINT_PORT": dbInstanceEndpointPort,
          }),
        },
        physicalResourceId: cr.PhysicalResourceId.of('CustomResourcePhysicalID'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [lambdaFunction.functionArn],  // specify the ARN of the Lambda function
        }),
      ]),
    });

  }
}
