#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import { RdsInitStackExample } from '../lib/rds-init-example';

const app = new cdk.App();

new RdsInitStackExample(app, 'RdsInitExample')
// new CdkRdsPopulateLambdaStack(app, 'CdkRdsPopulateLambdaStack', {
//     dbInstanceEndpointAddress: cdk.Fn.importValue('dbInstanceEndpointAddress-2'),
//     dbInstanceEndpointPort: cdk.Fn.importValue('dbInstanceEndpointPort-2'),
// });
