import { Construct } from 'constructs';
import { CfnInternetGateway, CfnVPCGatewayAttachment } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import { Vpc } from './vpc';
import * as cons from '../../constant';

/**
 * InternetGateway クラスの引数用インターフェース.
 */
interface InternetGatewayProps {
  readonly vpc: Vpc;
}

interface ResourceInfo extends BaseInfo {
  vpcId: string;
  assign: (c: Construct) => void;
}

/**
 * InternetGateway を生成するリソースクラス
 */
export class InternetGateway extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ec2.internetGateway.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ec2.internetGateway.short;

  public readonly main: CfnInternetGateway;

  private readonly vpc: Vpc;
  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'main',
        vpcId: this.vpc.main.ref,
        assign: (c) => ((this.main as CfnInternetGateway) = c as CfnInternetGateway),
      },
    ];
  }

  constructor(parentProps: BaseProps, internetGatewayProps: InternetGatewayProps) {
    super(parentProps);

    this.vpc = internetGatewayProps.vpc;

    for (const ri of this.createResourceList()) {
      ri.assign(this.createInternetGateway(ri));
    }
  }

  private createInternetGateway(ri: ResourceInfo): CfnInternetGateway {
    const ig = new CfnInternetGateway(this.scope, this.createLogicalId(ri.originName), {
      tags: [this.createNameTagProps(ri.originName)],
    });

    new CfnVPCGatewayAttachment(this.scope, this.createLogicalId(`${ri.originName}-attachment`), {
      vpcId: ri.vpcId,
      internetGatewayId: ig.ref,
    });

    return ig;
  }
}
