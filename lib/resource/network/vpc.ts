import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import * as cons from '../../constant';

interface ResourceInfo extends BaseInfo {
  ciderBlock: string;
  assign: (c: Construct) => void;
}

/**
 * vpc を生成するリソースクラス
 */
export class Vpc extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ec2.vpc.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ec2.vpc.short;

  public readonly main: CfnVPC;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'main',
        ciderBlock: '10.10.0.0/16',
        assign: (c) => ((this.main as CfnVPC) = c as CfnVPC),
      },
    ];
  }

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const ri of this.createResourceList()) {
      ri.assign(this.createVPC(ri));
    }
  }

  private createVPC(ri: ResourceInfo): CfnVPC {
    return new CfnVPC(this.scope, this.createLogicalId(ri.originName), {
      cidrBlock: ri.ciderBlock,
      tags: [this.createNameTagProps(ri.originName)],
    });
  }
}
