import { CfnTargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import { Vpc } from '../network/vpc';
import * as cons from '../../constant';

interface ResourceProps {
  readonly vpc: Vpc;
}

interface ResourceInfo extends BaseInfo {
  readonly protocol: 'HTTP' | 'HTTPS';
  readonly targetType: 'instance' | 'ip' | 'lambda' | 'alb';
  readonly port: number;
  readonly healthCheckPath: string;
  readonly vpcId: string;
  readonly assign: (tg: TargetGroup, cfnLb: CfnTargetGroup) => void;
}

/**
 * ApplicationLoadBalancer を生成するリソースクラス
 */
export class TargetGroup extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.elb.targetGroup.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.elb.targetGroup.short;

  public readonly test1: CfnTargetGroup;
  public readonly test2: CfnTargetGroup;

  private readonly vpc: Vpc;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'test1',
        protocol: 'HTTP',
        targetType: 'instance',
        port: 80,
        healthCheckPath: '/index.html',
        vpcId: this.vpc.main.ref,
        assign: (tg, cfnLb) => ((tg.test1 as CfnTargetGroup) = cfnLb),
      },
      {
        originName: 'test2',
        protocol: 'HTTP',
        targetType: 'instance',
        port: 8080,
        healthCheckPath: '/index.html',
        vpcId: this.vpc.main.ref,
        assign: (tg, cfnLb) => ((tg.test2 as CfnTargetGroup) = cfnLb),
      },
    ];
  }

  constructor(parentProps: BaseProps, tgProps: ResourceProps) {
    super(parentProps);

    this.vpc = tgProps.vpc;

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createLoadBalancer(ri));
    }
  }

  private createLoadBalancer(ri: ResourceInfo): CfnTargetGroup {
    return new CfnTargetGroup(this.scope, this.createLogicalId(ri.originName), {
      name: this.createResourceName(ri.originName),
      targetType: ri.targetType,
      protocol: ri.protocol,
      port: ri.port,
      healthCheckPath: ri.healthCheckPath,
      vpcId: ri.vpcId,
    });
  }
}
