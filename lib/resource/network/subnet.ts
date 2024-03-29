import { CfnSubnet } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import { Vpc } from './vpc';
import * as cons from '../../constant';

/**
 * Subnet クラスの引数用インターフェース.
 */
interface SubnetProps {
  vpc: Vpc;
}

/**
 * Subnet 生成に必要な情報を持つインターフェース
 */
interface ResourceInfo extends BaseInfo {
  cidrBlock: string;
  availabilityZone: string;
  mapPublicIpOnLaunch: boolean;
  /**
   * メンバ変数に生成したCfnSubnetインスタンスを代入する処理を実装する.
   *
   * @example
   * assign: (s, subnet) => ((s.publicA as CfnSubnet) = subnet)
   *
   * @privateRemarks
   * 第1引数にSubnetクラス自身を設定するのはアロー関数内でthisを使用する場合の不振挙動を抑制するため.
   * メンバ変数がreadonlyの場合代入時にキャストする必要あり(※ほんとはあまりよろしくない).
   */
  assign: (s: Subnet, subnet: CfnSubnet) => void;
}

/**
 * Subnet を生成するリソースクラス
 */
export class Subnet extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ec2.subnet.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ec2.subnet.short;

  public readonly publicA: CfnSubnet;
  public readonly publicC: CfnSubnet;
  public readonly privateA: CfnSubnet;
  public readonly privateC: CfnSubnet;

  private readonly vpc: Vpc;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'public-a',
        cidrBlock: '10.10.1.0/24',
        availabilityZone: 'ap-northeast-1a',
        mapPublicIpOnLaunch: true,
        assign: (s, subnet) => ((s.publicA as CfnSubnet) = subnet),
      },
      {
        originName: 'public-c',
        cidrBlock: '10.10.2.0/24',
        availabilityZone: 'ap-northeast-1c',
        mapPublicIpOnLaunch: true,
        assign: (s, subnet) => ((s.publicC as CfnSubnet) = subnet),
      },
      {
        originName: 'private-a',
        cidrBlock: '10.10.11.0/24',
        availabilityZone: 'ap-northeast-1a',
        mapPublicIpOnLaunch: false,
        assign: (s, subnet) => ((s.privateA as CfnSubnet) = subnet),
      },
      {
        originName: 'private-c',
        cidrBlock: '10.10.12.0/24',
        availabilityZone: 'ap-northeast-1c',
        mapPublicIpOnLaunch: false,
        assign: (s, subnet) => ((s.privateC as CfnSubnet) = subnet),
      },
    ];
  }

  constructor(parentProps: BaseProps, subnetProps: SubnetProps) {
    super(parentProps);

    this.vpc = subnetProps.vpc;

    for (const resourceInfo of this.createResourceList()) {
      resourceInfo.assign(this, this.createSubnet(resourceInfo));
    }
  }

  /**
   * subnet を生成する.
   *
   * @param ri - 生成するsubnetの情報を持ったインターフェース
   * @returns 生成したsubnetインスタンス
   */
  private createSubnet(ri: ResourceInfo): CfnSubnet {
    return new CfnSubnet(this.scope, this.createLogicalId(ri.originName), {
      vpcId: this.vpc.main.ref,
      cidrBlock: ri.cidrBlock,
      availabilityZone: ri.availabilityZone,
      mapPublicIpOnLaunch: ri.mapPublicIpOnLaunch,
      tags: [this.createNameTagProps(ri.originName)],
    });
  }
}
