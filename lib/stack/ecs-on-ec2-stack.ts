import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IamRole } from '../resource/ecs-on-ec2/iam-role';
import { SecurityGroup } from '../resource/ecs-on-ec2/security-group';
import { Instance } from '../resource/ecs-on-ec2/ec2-instance';
import { EcsCluster } from '../resource/ecs-on-ec2/ecs-cluster';
import { NetworkStack } from '../stack/network-stack';

/**
 * NetworkStack を作成するクラス.
 */
export class EcsOnEc2Stack extends cdk.Stack {
  public readonly role: IamRole;
  public readonly sg: SecurityGroup;
  public readonly ins: Instance;
  public readonly cluster: EcsCluster;

  constructor(scope: Construct, id: string, networkStack: NetworkStack, props?: cdk.StackProps) {
    super(scope, id, props);
    this.role = new IamRole({ scope: this });
    this.sg = new SecurityGroup({ scope: this }, { vpc: networkStack.vpc });
    this.ins = new Instance(
      { scope: this },
      { role: this.role, sg: this.sg, subnet: networkStack.subnet }
    );
    this.cluster = new EcsCluster({ scope: this });
  }
}
