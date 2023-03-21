import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BaseStack, BaseStackProps } from './abstruct/base-stack';
import { Vpc } from '../resource/network/vpc';
import { Subnet } from '../resource/network/subnet';
import { InternetGateway } from '../resource/network/internet-gateway';
import { RouteTable } from '../resource/network/route-table';

/**
 * NetworkStack を作成するクラス.
 */
export class NetworkStack extends BaseStack {
  public readonly vpc: Vpc;
  public readonly subnet: Subnet;
  public readonly internetGateway: InternetGateway;
  public readonly routeTable: RouteTable;

  constructor(parentProps: BaseStackProps) {
    super(parentProps);

    this.vpc = new Vpc({ scope: this });
    this.subnet = new Subnet({ scope: this }, { vpc: this.vpc });
    this.internetGateway = new InternetGateway({ scope: this }, { vpc: this.vpc });
    this.routeTable = new RouteTable(
      { scope: this },
      { vpc: this.vpc, subent: this.subnet, internetGateway: this.internetGateway }
    );
  }
}
