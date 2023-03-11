import { CfnRouteTable, CfnRoute, CfnSubnetRouteTableAssociation } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { Vpc } from './vpc';
import { Subnet } from './subnet';
import { InternetGateway } from './internet-gateway';
import * as cons from '../../constant';

/**
 * RouteTable クラスの引数用インターフェース.
 */
interface RouteTableProps {
  vpc: Vpc;
  subent: Subnet;
  internetGateway: InternetGateway;
}

/**
 * Route 生成に必要な情報を持つインターフェース
 */
interface RouteInfo {
  originName: string;
  destinationCidrBlock: string;
  gatewayId: (rt: RouteTable) => string;
}

/**
 * Route 生成に必要な情報を持つインターフェース
 */
interface SubnetRouteTableAssociationInfo {
  originName: string;
  subnetId: (rt: RouteTable) => string;
}

/**
 * RouteTable 生成に必要な情報を持つインターフェース
 */
interface ResourceInfo {
  originName: string;
  associationList: SubnetRouteTableAssociationInfo[];
  routeList: RouteInfo[];
  /**
   * メンバ変数に生成した Cfn インスタンスを代入する処理を実装する.
   *
   * @example
   * assign: (s, subnet) => ((s.publicA as CfnSubnet) = subnet)
   *
   * @privateRemarks
   * 第1引数に自クラスを設定するのはアロー関数内でthisを使用する場合の不振挙動を抑制するため.
   * メンバ変数がreadonlyの場合代入時にキャストする必要あり(※ほんとはあまりよろしくない).
   */
  assign: (rt: RouteTable, routeTable: CfnRouteTable) => void;
}

/**
 * Subnet を生成するリソースクラス
 */
export class RouteTable extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ec2.routeTable.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ec2.routeTable.short;

  public readonly publicCommon: CfnRouteTable;
  public readonly privateCommon: CfnRouteTable;

  private readonly vpc: Vpc;
  private readonly igw: InternetGateway;
  private readonly subnet: Subnet;
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'public-common',
      routeList: [
        {
          originName: 'PublicRouteCommon',
          destinationCidrBlock: '0.0.0.0/0',
          gatewayId: (rt) => rt.igw.main.ref,
        },
      ],
      associationList: [
        {
          originName: 'SubnetAssociationPublicA',
          subnetId: (rt) => rt.subnet.publicA.ref,
        },
        {
          originName: 'SubnetAssociationPublicC',
          subnetId: (rt) => rt.subnet.publicC.ref,
        },
      ],
      assign: (rt, routeTable) => ((rt.publicCommon as CfnRouteTable) = routeTable),
    },
    {
      originName: 'private-common',
      routeList: [],
      associationList: [
        {
          originName: 'SubnetAssociationPrivateA',
          subnetId: (rt) => rt.subnet.privateA.ref,
        },
        {
          originName: 'SubnetAssociationPrivateC',
          subnetId: (rt) => rt.subnet.privateC.ref,
        },
      ],
      assign: (rt, routeTable) => ((rt.publicCommon as CfnRouteTable) = routeTable),
    },
  ];

  constructor(parentProps: BaseProps, rtProps: RouteTableProps) {
    super(parentProps);

    this.vpc = rtProps.vpc;
    this.subnet = rtProps.subent;
    this.igw = rtProps.internetGateway;

    for (const resourceInfo of this.resourceList) {
      resourceInfo.assign(this, this.createRouteTable(resourceInfo));
    }
  }

  /**
   * RouteTable を生成する.
   *
   * @remarks
   * RouteTable に紐づくsubnet情報(SubnetRouteTableAssociation), ルーティングルール(Route)の生成処理もここで実行される.
   *
   * @param resourceInfo - 生成する subnet の情報を持ったインターフェース
   * @returns 生成した RouteTable インスタンス
   */
  private createRouteTable(resourceInfo: ResourceInfo): CfnRouteTable {
    const rt = new CfnRouteTable(this.scope, this.createLogicalId(resourceInfo.originName), {
      vpcId: this.vpc.main.ref,
      tags: [this.createNameTagProps(resourceInfo.originName)],
    });

    for (const routeInfo of resourceInfo.routeList) {
      this.createRoute(rt, routeInfo);
    }

    for (const associationInfo of resourceInfo.associationList) {
      this.createSubnetRouteTableAssociation(rt, associationInfo);
    }

    return rt;
  }

  /**
   * Route を生成する.
   *
   * @param rt - Routeを設定するRouteTable情報
   * @param routeInfo - 生成する Route の情報を持ったインターフェース
   */
  private createRoute(rt: CfnRouteTable, routeInfo: RouteInfo) {
    new CfnRoute(this.scope, this.createLogicalId(routeInfo.originName), {
      routeTableId: rt.ref,
      destinationCidrBlock: routeInfo.destinationCidrBlock,
      gatewayId: routeInfo.gatewayId(this),
    });
  }

  /**
   * SubnetRouteTableAssociation を生成する.
   *
   * @param rt - Subnet と紐づける RotueTable 情報
   * @param associationInfo - 生成する SubnetRouteTableAssociation の情報を持ったインターフェース
   */
  private createSubnetRouteTableAssociation(
    rt: CfnRouteTable,
    associationInfo: SubnetRouteTableAssociationInfo
  ) {
    new CfnSubnetRouteTableAssociation(
      this.scope,
      this.createLogicalId(associationInfo.originName),
      {
        routeTableId: rt.ref,
        subnetId: associationInfo.subnetId(this),
      }
    );
  }
}
