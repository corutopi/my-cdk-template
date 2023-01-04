import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Vpc } from '../resource/network/vpc';
import { Subnet } from '../resource/network/subnet';
import { InternetGateway } from '../resource/network/internet-gateway';
import { RouteTable } from '../resource/network/route-table';

/**
 * NetworkStack を作成するクラス.
 */
export class NetworkStack extends cdk.Stack {
  public readonly vpc: Vpc;
  public readonly subnet: Subnet;
  public readonly internetGateway: InternetGateway;
  public readonly routeTable: RouteTable;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc({ scope: this });
    this.subnet = new Subnet({ scope: this }, { vpc: this.vpc });
    this.internetGateway = new InternetGateway({ scope: this }, { vpc: this.vpc });
    this.routeTable = new RouteTable(
      { scope: this },
      { vpc: this.vpc, subent: this.subnet, internetGateway: this.internetGateway }
    );
  }
}
