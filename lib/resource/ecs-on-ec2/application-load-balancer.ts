import { CfnLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { SecurityGroup } from './security-group';
import { Subnet } from '../network/subnet';

interface ResourceProps {
  readonly subnet: Subnet;
  readonly sg: SecurityGroup;
}

interface ResourceInfo {
  readonly originName: string;
  readonly subnets: ((alb: ApplicationLoadBalancer) => string)[];
  readonly securityGroups: ((alb: ApplicationLoadBalancer) => string)[];
  readonly assign: (lb: ApplicationLoadBalancer, cfnLb: CfnLoadBalancer) => void;
}

/**
 * ApplicationLoadBalancer を生成するリソースクラス
 */
export class ApplicationLoadBalancer extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'application-load-balancer';
  public readonly SERVICE_SHORT_NAME: string = 'alb';

  public readonly test: CfnLoadBalancer;

  private readonly subnet: Subnet;
  private readonly sg: SecurityGroup;
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'test',
      subnets: [(alb) => alb.subnet.publicA.attrSubnetId, (alb) => alb.subnet.publicC.attrSubnetId],
      securityGroups: [(alb) => alb.sg.http.attrGroupId],
      assign: (lb, cfnLb) => ((lb.test as CfnLoadBalancer) = cfnLb),
    },
  ];

  constructor(parentProps: BaseProps, albProps: ResourceProps) {
    super(parentProps);

    this.subnet = albProps.subnet;
    this.sg = albProps.sg;

    for (const ri of this.resourceList) {
      ri.assign(this, this.createLoadBalancer(ri));
    }
  }

  private createLoadBalancer(ri: ResourceInfo): CfnLoadBalancer {
    const subnets: string[] = [];
    for (const s of ri.subnets) subnets.push(s(this));
    const securityGroups: string[] = [];
    for (const sg of ri.securityGroups) securityGroups.push(sg(this));

    return new CfnLoadBalancer(this.scope, this.createLogicalId(ri.originName), {
      name: this.createResourceName(ri.originName),
      subnets: subnets,
      securityGroups: securityGroups,
      type: 'application',
    });
  }
}
