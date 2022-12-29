import { CfnSubnet } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { Vpc } from './vpc';

interface SubnetProps {
  vpc: Vpc;
}

interface ResourceInfo {
  originName: string;
  cidrBlock: string;
  assign: (s: Subnet, subnet: CfnSubnet) => void;
}

export class Subnet extends BaseResource {
  public readonly SERVICE_NAME: string = 'subnet';

  public readonly publicA: CfnSubnet;
  public readonly publicC: CfnSubnet;
  public readonly privateA: CfnSubnet;
  public readonly privateC: CfnSubnet;

  private readonly vpc: Vpc;
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'public-a',
      cidrBlock: '10.10.1.0/24',
      assign: (s, subnet) => ((s.publicA as CfnSubnet) = subnet),
    },
    {
      originName: 'public-c',
      cidrBlock: '10.10.2.0/24',
      assign: (s, subnet) => ((s.publicC as CfnSubnet) = subnet),
    },
    {
      originName: 'private-a',
      cidrBlock: '10.10.11.0/24',
      assign: (s, subnet) => ((s.privateA as CfnSubnet) = subnet),
    },
    {
      originName: 'private-c',
      cidrBlock: '10.10.12.0/24',
      assign: (s, subnet) => ((s.privateC as CfnSubnet) = subnet),
    },
  ];

  constructor(parentProps: BaseProps, subnetProps: SubnetProps) {
    super(parentProps);

    this.vpc = subnetProps.vpc;

    for (const resourceInfo of this.resourceList) {
      resourceInfo.assign(this, this.createSubnet(resourceInfo));
    }
  }

  private createSubnet(resourceInfo: ResourceInfo): CfnSubnet {
    return new CfnSubnet(this.scope, this.createLogicalId(resourceInfo.originName), {
      vpcId: this.vpc.main.ref,
      cidrBlock: resourceInfo.cidrBlock,
      tags: [this.createNameTagProps(resourceInfo.originName)],
    });
  }
}
