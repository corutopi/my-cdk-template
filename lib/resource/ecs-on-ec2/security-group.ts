import { CfnSecurityGroup, CfnSecurityGroupIngress } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { Vpc } from '../network/vpc';

interface ResourceProps {
  vpc: Vpc;
}

interface InboundRuleInfo {
  originName: string;
  ipProtocol: string;
  cidrIp?: string;
  sourceSecurityGroupId?: (sg: SecurityGroup) => string;
  fromPort: number;
  toPort: number;
  description: string;
}

interface ResourceInfo {
  originName: string;
  description: string;
  vpcId: (sg: SecurityGroup) => string;
  inboundRules?: InboundRuleInfo[];
  assign: (sg: SecurityGroup, cfnSg: CfnSecurityGroup) => void;
}

/**
 * SecurityGroup を生成するリソースクラス
 */
export class SecurityGroup extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'SecurityGroup';
  public readonly SERVICE_SHORT_NAME: string = 'sg';

  public readonly ssh: CfnSecurityGroup;
  public readonly alb: CfnSecurityGroup;
  public readonly ecs: CfnSecurityGroup;

  private readonly vpc: Vpc;
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'ssh',
      description: 'allow ssh access.',
      vpcId: (sg) => sg.vpc.main.ref,
      inboundRules: [
        {
          originName: 'all-ip',
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
          fromPort: 22,
          toPort: 22,
          description: '(all)',
        },
      ],
      assign: (sg, cfnSg) => ((sg.ssh as CfnSecurityGroup) = cfnSg),
    },
    {
      originName: 'alb',
      description: 'for alb.',
      vpcId: (sg) => sg.vpc.main.ref,
      inboundRules: [
        {
          originName: 'http',
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
          fromPort: 80,
          toPort: 80,
          description: 'allow http',
        },
        {
          originName: 'for-blue-green-http',
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
          fromPort: 8080,
          toPort: 8080,
          description: 'allow http (blue-green)',
        },
      ],
      assign: (sg, cfnSg) => ((sg.alb as CfnSecurityGroup) = cfnSg),
    },
    {
      originName: 'ecs',
      description: 'for ecs server.',
      vpcId: (sg) => sg.vpc.main.ref,
      inboundRules: [
        {
          originName: 'http',
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
          fromPort: 80,
          toPort: 80,
          description: 'allow http',
        },
      ],
      assign: (sg, cfnSg) => ((sg.ecs as CfnSecurityGroup) = cfnSg),
    },
  ];

  constructor(parentProps: BaseProps, props: ResourceProps) {
    super(parentProps);

    this.vpc = props.vpc;

    for (const ri of this.resourceList) {
      ri.assign(this, this.createSecurityGroup(ri));
    }
  }

  /**
   * SecurityGroup を生成する.
   *
   * @param ri - 生成する SecurityGroup の情報を持ったインターフェース
   * @returns 生成した SecurityGroup インスタンス
   */
  private createSecurityGroup(ri: ResourceInfo): CfnSecurityGroup {
    const sg = new CfnSecurityGroup(this.scope, this.createLogicalId(ri.originName), {
      groupDescription: ri.description,
      groupName: this.createResourceName(ri.originName),
      vpcId: ri.vpcId(this),
      tags: [this.createNameTagProps(ri.originName)],
    });

    if (ri.inboundRules) {
      for (const iri of ri.inboundRules) this.createSecurityGroupIngress(iri, sg, ri.originName);
    }

    return sg;
  }

  /**
   * SecurityGroupIngress を生成する.
   *
   * @param iri - 生成する SecurityGroup の情報を持ったインターフェース
   * @param sg - 生成する SecurityGroupIngress を設定する SecurityGroup
   * @param sgOriginName - sg の生成に使用した originName. 一意な論理IDを生成するために使用する.
   */
  private createSecurityGroupIngress(
    iri: InboundRuleInfo,
    sg: CfnSecurityGroup,
    sgOriginName: string
  ): void {
    new CfnSecurityGroupIngress(
      this.scope,
      this.createLogicalId(`Ingress-${sgOriginName}-${iri.originName}`),
      {
        cidrIp: iri.cidrIp,
        ipProtocol: iri.ipProtocol,
        fromPort: iri.fromPort,
        toPort: iri.toPort,
        groupId: sg.attrGroupId,
        sourceSecurityGroupId: iri.sourceSecurityGroupId
          ? iri.sourceSecurityGroupId(this)
          : undefined,
      }
    );
  }
}
