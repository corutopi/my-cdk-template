import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

import { BaseResource } from '../abstruct/base-resource';

export class Vpc extends BaseResource {
    readonly SERVICE_NAME: string = 'vpc';

    readonly main: CfnVPC;

    constructor(scope: Construct, cidrBlock: string) {
        super();

        this.main = new CfnVPC(scope, 'VPC', {
            cidrBlock: cidrBlock,
            tags: [this.createNameTagProps('main')],
        });
    }
}
