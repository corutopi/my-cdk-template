import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

export class Vpc extends BaseResource {
  public readonly SERVICE_NAME: string = 'vpc';

  public readonly main: CfnVPC;

  constructor(parentProps: BaseProps) {
    super(parentProps);

    this.main = new CfnVPC(this.scope, 'VPC', {
      cidrBlock: '10.10.0.0/16',
      tags: [this.createNameTagProps('main')],
    });
  }
}
