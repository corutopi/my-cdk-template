import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Vpc } from '../resource/network/vpc';

export class NetworkStack extends cdk.Stack {
    readonly vpc: Vpc;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // vpc
        this.vpc = new Vpc(this, '10.10.0.0/16');
    }
}
