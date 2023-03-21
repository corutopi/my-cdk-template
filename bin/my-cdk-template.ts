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

const networkStack = new NetworkStack({ id: 'network', scope: app });
const lambdaStack = new LambdakStack({ id: 'lambda', scope: app });
const ecsOnEc2Stack = new EcsOnEc2Stack({ id: 'ecs-on-ec2', scope: app }, { networkStack });
