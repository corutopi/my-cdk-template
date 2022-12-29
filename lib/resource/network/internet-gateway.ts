import { CfnInternetGateway, CfnVPCGatewayAttachment } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { Vpc } from './vpc';

interface InternetGatewayProps {
  readonly vpc: Vpc;
}

export class InternetGateway extends BaseResource {
  public readonly SERVICE_NAME: string = 'internet-gateway';

  public readonly main: CfnInternetGateway;

  private readonly vpc: Vpc;
  constructor(parentProps: BaseProps, internetGatewayProps: InternetGatewayProps) {
    super(parentProps);

    this.vpc = internetGatewayProps.vpc;

    this.main = new CfnInternetGateway(this.scope, this.createLogicalId('main'), {
      tags: [this.createNameTagProps('main')],
    });
    new CfnVPCGatewayAttachment(this.scope, this.createLogicalId('main-attachment'), {
      vpcId: this.vpc.main.ref,
      internetGatewayId: this.main.ref,
    });
  }
}
