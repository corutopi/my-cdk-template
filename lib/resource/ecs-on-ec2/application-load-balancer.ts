import { CfnLoadBalancer, CfnListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { SecurityGroup } from './security-group';
import { TargetGroup } from './target-group';
import { Subnet } from '../network/subnet';
import * as cons from '../../constant';

interface ResourceProps {
  readonly subnet: Subnet;
  readonly sg: SecurityGroup;
  readonly tg: TargetGroup;
}

interface ListenerInfo {
  readonly originName: string;
  readonly defaultActions: {
    readonly type: 'forward';
    readonly targetGroupArn: string;
  }[];
  readonly port: number;
  readonly protocol: 'HTTP' | 'HTTPS';
  readonly assign: (lb: ApplicationLoadBalancer, cfnListener: CfnListener) => void;
}

interface ResourceInfo {
  readonly originName: string;
  readonly subnets: string[];
  readonly securityGroups: string[];
  readonly listeners: ListenerInfo[];
  readonly assign: (lb: ApplicationLoadBalancer, cfnLb: CfnLoadBalancer) => void;
}

/**
 * ApplicationLoadBalancer を生成するリソースクラス
 */
export class ApplicationLoadBalancer extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.elb.alb.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.elb.alb.short;

  public readonly test: CfnLoadBalancer;
  public readonly testListener80: CfnListener;
  public readonly testListener8080: CfnListener;

  private readonly subnet: Subnet;
  private readonly sg: SecurityGroup;
  private readonly tg: TargetGroup;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'test',
        subnets: [this.subnet.publicA.attrSubnetId, this.subnet.publicC.attrSubnetId],
        securityGroups: [this.sg.alb.attrGroupId],
        listeners: [
          {
            originName: 'blue-port',
            defaultActions: [{ type: 'forward', targetGroupArn: this.tg.test1.ref }],
            port: 80,
            protocol: 'HTTP',
            assign: (alb, cfnListener) => ((alb.testListener80 as CfnListener) = cfnListener),
          },
          {
            originName: 'green-port',
            defaultActions: [{ type: 'forward', targetGroupArn: this.tg.test2.ref }],
            port: 8080,
            protocol: 'HTTP',
            assign: (alb, cfnListener) => ((alb.testListener8080 as CfnListener) = cfnListener),
          },
        ],
        assign: (lb, cfnLb) => ((lb.test as CfnLoadBalancer) = cfnLb),
      },
    ];
  }

  constructor(parentProps: BaseProps, albProps: ResourceProps) {
    super(parentProps);

    this.subnet = albProps.subnet;
    this.sg = albProps.sg;
    this.tg = albProps.tg;

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createLoadBalancer(ri));
    }
  }

  private createLoadBalancer(ri: ResourceInfo): CfnLoadBalancer {
    const alb = new CfnLoadBalancer(this.scope, this.createLogicalId(ri.originName), {
      name: this.createResourceName(ri.originName),
      subnets: ri.subnets,
      securityGroups: ri.securityGroups,
      type: 'application',
    });
    for (const li of ri.listeners) li.assign(this, this.createListener(li, alb));

    return alb;
  }

  private createListener(li: ListenerInfo, cfnLb: CfnLoadBalancer): CfnListener {
    return new CfnListener(this.scope, this.createLogicalId(`listener-${li.originName}`), {
      defaultActions: li.defaultActions,
      loadBalancerArn: cfnLb.ref,
      port: li.port,
      protocol: li.protocol,
    });
  }
}
