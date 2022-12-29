import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Vpc } from '../resource/network/vpc';
import { Subnet } from '../resource/network/subnet';
import { InternetGateway } from '../resource/network/internet-gateway';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: Vpc;
  public readonly subnet: Subnet;
  public readonly internetGateway: InternetGateway;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc({ scope: this });
    this.subnet = new Subnet({ scope: this }, { vpc: this.vpc });
    this.internetGateway = new InternetGateway({ scope: this }, { vpc: this.vpc });
  }
}
