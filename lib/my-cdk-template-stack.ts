import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { NetworkStack } from './stack/network-stack';
import { LambdakStack } from './stack/lambda-stack';

export class MyCdkTemplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const networkStack = new NetworkStack(scope, 'NetWorkStack', {
      stackName: 'network-stack',
    });
    const lambdaStack = new LambdakStack(scope, 'LambdaStack', {
      stackName: 'lambda-stack',
    });
  }
}
