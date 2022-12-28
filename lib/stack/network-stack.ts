import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Vpc } from '../resource/network/vpc';

export class NetworkStack extends cdk.Stack {
  readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc({ scope: this }, { cidrBlock: '10.10.0.0/16' });
  }
}
