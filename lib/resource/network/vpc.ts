import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

interface VpcProps {
  cidrBlock: string;
}

export class Vpc extends BaseResource {
  public readonly SERVICE_NAME: string = 'vpc';

  public readonly main: CfnVPC;

  constructor(parentProps: BaseProps, vpcProps: VpcProps) {
    super(parentProps);

    this.main = new CfnVPC(this.scope, 'VPC', {
      cidrBlock: vpcProps.cidrBlock,
      tags: [this.createNameTagProps('main')],
    });
  }
}
