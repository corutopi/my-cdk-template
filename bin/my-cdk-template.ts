#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as fs from 'fs';

import { NetworkStack } from '../lib/stack/network-stack';
import { LambdakStack } from '../lib/stack/lambda-stack';
import { EcsOnEc2Stack } from '../lib/stack/ecs-on-ec2-stack';

const LOCAL_SETTING: string = './env.context.json';
const f = fs.existsSync(LOCAL_SETTING) ? JSON.parse(fs.readFileSync(LOCAL_SETTING, 'utf-8')) : {};

const app = new cdk.App({ postCliContext: f });

const networkStack = new NetworkStack(app, 'NetWorkStack', {
  stackName: 'network-stack',
});
const lambdaStack = new LambdakStack(app, 'LambdaStack', {
  stackName: 'lambda-stack',
});
const ecsOnEc2Stack = new EcsOnEc2Stack(app, 'EcsOnEc2Stack', networkStack, {
  stackName: 'ecs-on-ec2-stack',
});
