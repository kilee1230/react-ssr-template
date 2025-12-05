#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ReactSsrStack } from '../lib/react-ssr-stack';

const app = new cdk.App();

new ReactSsrStack(app, 'ReactSsrStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
