import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import * as cons from '../../constant';

/**
 * vpc を生成するリソースクラス
 */
export class Vpc extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ec2.vpc.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ec2.vpc.short;

  public readonly main: CfnVPC;

  constructor(parentProps: BaseProps) {
    super(parentProps);

    this.main = new CfnVPC(this.scope, this.createLogicalId('main'), {
      cidrBlock: '10.10.0.0/16',
      tags: [this.createNameTagProps('main')],
    });
  }
}
