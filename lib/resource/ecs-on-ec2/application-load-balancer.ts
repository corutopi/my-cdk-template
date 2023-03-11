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
    readonly targetGroupArn: (alb: ApplicationLoadBalancer) => string;
  }[];
  readonly port: number;
  readonly protocol: 'HTTP' | 'HTTPS';
  readonly assign: (lb: ApplicationLoadBalancer, cfnListener: CfnListener) => void;
}

interface ResourceInfo {
  readonly originName: string;
  readonly subnets: ((alb: ApplicationLoadBalancer) => string)[];
  readonly securityGroups: ((alb: ApplicationLoadBalancer) => string)[];
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
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'test',
      subnets: [(alb) => alb.subnet.publicA.attrSubnetId, (alb) => alb.subnet.publicC.attrSubnetId],
      securityGroups: [(alb) => alb.sg.alb.attrGroupId],
      listeners: [
        {
          originName: 'blue-port',
          defaultActions: [{ type: 'forward', targetGroupArn: (alb) => alb.tg.test1.ref }],
          port: 80,
          protocol: 'HTTP',
          assign: (alb, cfnListener) => ((alb.testListener80 as CfnListener) = cfnListener),
        },
        {
          originName: 'green-port',
          defaultActions: [{ type: 'forward', targetGroupArn: (alb) => alb.tg.test2.ref }],
          port: 8080,
          protocol: 'HTTP',
          assign: (alb, cfnListener) => ((alb.testListener8080 as CfnListener) = cfnListener),
        },
      ],
      assign: (lb, cfnLb) => ((lb.test as CfnLoadBalancer) = cfnLb),
    },
  ];

  constructor(parentProps: BaseProps, albProps: ResourceProps) {
    super(parentProps);

    this.subnet = albProps.subnet;
    this.sg = albProps.sg;
    this.tg = albProps.tg;

    for (const ri of this.resourceList) {
      ri.assign(this, this.createLoadBalancer(ri));
    }
  }

  private createLoadBalancer(ri: ResourceInfo): CfnLoadBalancer {
    const subnets: string[] = [];
    for (const s of ri.subnets) subnets.push(s(this));
    const securityGroups: string[] = [];
    for (const sg of ri.securityGroups) securityGroups.push(sg(this));

    const alb = new CfnLoadBalancer(this.scope, this.createLogicalId(ri.originName), {
      name: this.createResourceName(ri.originName),
      subnets: subnets,
      securityGroups: securityGroups,
      type: 'application',
    });
    for (const li of ri.listeners) li.assign(this, this.createListener(li, alb));

    return alb;
  }

  private createListener(li: ListenerInfo, cfnLb: CfnLoadBalancer): CfnListener {
    const defaultActions: CfnListener.ActionProperty[] = [];
    for (const da of li.defaultActions) {
      defaultActions.push({
        type: da.type,
        targetGroupArn: da.targetGroupArn(this),
      });
    }

    return new CfnListener(this.scope, this.createLogicalId(`listener-${li.originName}`), {
      defaultActions: defaultActions,
      loadBalancerArn: cfnLb.ref,
      port: li.port,
      protocol: li.protocol,
    });
  }
}
