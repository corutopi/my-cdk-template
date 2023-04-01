import * as fs from 'fs';

import { CfnResource } from 'aws-cdk-lib/core';
import { CfnInstance } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import { IamRole } from './iam-role';
import { SecurityGroup } from './security-group';
import { EcsCluster } from './ecs-cluster';
import { Subnet } from '../network/subnet';
import * as cons from '../../constant';

interface ResourceProps {
  readonly role: IamRole;
  readonly sg: SecurityGroup;
  readonly subnet: Subnet;
  readonly cluster: EcsCluster;
}

interface ResourceInfo extends BaseInfo {
  readonly imageId: string;
  readonly keyName: string;
  readonly iamInstanceProfile: string;
  readonly instanceType: string;
  readonly securityGroupIds: string[];
  readonly subnetId: string;
  readonly userData: string;
  readonly dependOn: CfnResource[];
  readonly assign: (ins: Instance, cfnIns: CfnInstance) => void;
}

/**
 * Instance を生成するリソースクラス
 */
export class Instance extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ec2.instance.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ec2.instance.short;

  public readonly ecs: CfnInstance;

  private readonly role: IamRole;
  private readonly sg: SecurityGroup;
  private readonly subnet: Subnet;
  private readonly cluster: EcsCluster;
  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'ecs',
        imageId: 'ami-0a32d9b36af77b72e',
        keyName: 'my-key',
        iamInstanceProfile: this.role.forEcsInstanceProfile.ref,
        instanceType: 't3a.small',
        securityGroupIds: [this.sg.ecs.attrGroupId, this.sg.ssh.attrGroupId],
        subnetId: this.subnet.publicA.ref,
        userData: fs.readFileSync(`${__dirname}/user-data/user-data.sh`, 'base64'),
        dependOn: [this.cluster.test as CfnResource],
        assign: (ins, cfnIns) => ((ins.ecs as CfnInstance) = cfnIns),
      },
    ];
  }

  constructor(parentProps: BaseProps, props: ResourceProps) {
    super(parentProps);

    this.role = props.role;
    this.sg = props.sg;
    this.subnet = props.subnet;
    this.cluster = props.cluster;

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createInstance(ri));
    }
  }

  private createInstance(ri: ResourceInfo): CfnInstance {
    const ins = new CfnInstance(this.scope, this.createLogicalId(ri.originName), {
      imageId: ri.imageId,
      keyName: ri.keyName,
      iamInstanceProfile: ri.iamInstanceProfile,
      instanceType: ri.instanceType,
      securityGroupIds: ri.securityGroupIds,
      subnetId: ri.subnetId,
      userData: ri.userData,
      tags: [this.createNameTagProps(ri.originName)],
    });

    for (const dependOn of ri.dependOn) ins.addDependsOn(dependOn);

    return ins;
  }
}
