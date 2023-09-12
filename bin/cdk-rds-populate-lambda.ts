#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkRdsPopulateLambdaStack } from '../lib/cdk-rds-populate-lambda-stack';

const app = new cdk.App();
new CdkRdsPopulateLambdaStack(app, 'CdkRdsPopulateLambdaStack', {
    dbInstanceEndpointAddress: cdk.Fn.importValue('dbInstanceEndpointAddress-2'),
    dbInstanceEndpointPort: cdk.Fn.importValue('dbInstanceEndpointPort-2'),
});
