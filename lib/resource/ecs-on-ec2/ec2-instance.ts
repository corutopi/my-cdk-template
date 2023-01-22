import * as fs from 'fs';

import { CfnInstance } from 'aws-cdk-lib/aws-ec2';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { IamRole } from './iam-role';
import { SecurityGroup } from './security-group';
import { Subnet } from '../network/subnet';

interface ResourceProps {
  readonly role: IamRole;
  readonly sg: SecurityGroup;
  readonly subnet: Subnet;
}

interface ResourceInfo {
  readonly originName: string;
  readonly imageId: string;
  readonly keyName: string;
  readonly iamInstanceProfile: (ins: Instance) => string;
  readonly instanceType: string;
  readonly securityGroupIds: ((ins: Instance) => string)[];
  readonly subnetId: (ins: Instance) => string;
  readonly userData: string;
  readonly assign: (ins: Instance, cfnIns: CfnInstance) => void;
}

/**
 * Instance を生成するリソースクラス
 */
export class Instance extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'instance';
  public readonly SERVICE_SHORT_NAME: string = 'ins';

  public readonly ecs: CfnInstance;

  private readonly role: IamRole;
  private readonly sg: SecurityGroup;
  private readonly subnet: Subnet;
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'ecs',
      imageId: 'ami-0a32d9b36af77b72e',
      keyName: 'my-key',
      iamInstanceProfile: (ins) => ins.role.forEcsInstanceProfile.ref,
      instanceType: 't3a.small',
      securityGroupIds: [(ins) => ins.sg.http.attrGroupId, (ins) => ins.sg.ssh.attrGroupId],
      subnetId: (ins) => ins.subnet.publicA.ref,
      userData: fs.readFileSync(`${__dirname}/user-data/user-data.sh`, 'base64'),
      assign: (ins, cfnIns) => ((ins.ecs as CfnInstance) = cfnIns),
    },
  ];

  constructor(parentProps: BaseProps, props: ResourceProps) {
    super(parentProps);

    this.role = props.role;
    this.sg = props.sg;
    this.subnet = props.subnet;

    for (const ri of this.resourceList) {
      ri.assign(this, this.createInstance(ri));
    }
  }

  private createInstance(ri: ResourceInfo): CfnInstance {
    const securityGroupIds: string[] = [];
    for (const sgi of ri.securityGroupIds) securityGroupIds.push(sgi(this));

    return new CfnInstance(this.scope, this.createLogicalId(ri.originName), {
      imageId: ri.imageId,
      keyName: ri.keyName,
      iamInstanceProfile: ri.iamInstanceProfile(this),
      instanceType: ri.instanceType,
      securityGroupIds: securityGroupIds,
      subnetId: ri.subnetId(this),
      userData: ri.userData,
      tags: [this.createNameTagProps(ri.originName)],
    });
  }
}
