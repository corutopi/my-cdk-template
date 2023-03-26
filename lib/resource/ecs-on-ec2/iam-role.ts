import { CfnRole, CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import * as cons from '../../constant';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

/**
 * InstanceProfile 生成に必要な情報を持つインターフェース
 */
interface InstanceProfileInfo {
  readonly originName: string;
  readonly assign: (role: IamRole, cfnIp: CfnInstanceProfile) => void;
}

/**
 * IamRole の信頼関係に指定するJSON情報を持つインターフェース
 */
interface TrustRelationshipPolicyDocumentJSON {
  readonly Version: '2012-10-17';
  readonly Statement: {
    readonly Effect: 'Allow' | 'Deny';
    readonly Principal: { [key: string]: string };
    readonly Action: 'sts:AssumeRole';
  }[];
}

/**
 * IamRole 生成に必要な情報を持つインターフェース
 */
interface ResourceInfo {
  readonly originName: string;
  readonly assumeRolePolicyDocument: TrustRelationshipPolicyDocumentJSON;
  readonly managedPolicyArns: string[];
  readonly policies?: CfnRole.PolicyProperty[];
  readonly instanceProfile?: InstanceProfileInfo;
  readonly assign: (role: IamRole, iamRole: CfnRole) => void;
}

/**
 * IamRole を生成するリソースクラス
 */
export class IamRole extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.iam.role.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.iam.role.short;

  public readonly forEcs: CfnRole;
  public readonly forEcsCodeDeploy: CfnRole;
  public readonly forEcsInstanceProfile: CfnInstanceProfile;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'for-ecs',
        assumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        },
        managedPolicyArns: [
          'arn:aws:iam::aws:policy/AmazonECS_FullAccess',
          'arn:aws:iam::aws:policy/AmazonEC2FullAccess',
        ],
        instanceProfile: {
          originName: 'for-ecs',
          assign: (role, cfnIp) => ((role.forEcsInstanceProfile as CfnInstanceProfile) = cfnIp),
        },
        assign: (role, iamRole) => ((role.forEcs as CfnRole) = iamRole),
      },
      {
        originName: 'for-ecs-code-deploy',
        assumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'codedeploy.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        },
        managedPolicyArns: ['arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS'],
        assign: (role, iamRole) => ((role.forEcsCodeDeploy as CfnRole) = iamRole),
      },
    ];
  }

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const resourceInfo of this.createResourceList()) {
      resourceInfo.assign(this, this.createIamRole(resourceInfo));
    }
  }

  /**
   * IamRole を生成する.
   *
   * @param ri - 生成するiam-roleの情報を持ったインターフェース
   * @returns 生成したiam-roleインスタンス
   */
  private createIamRole(ri: ResourceInfo): CfnRole {
    const role = new CfnRole(this.scope, this.createLogicalId(ri.originName), {
      roleName: this.createResourceName(ri.originName),
      assumeRolePolicyDocument: ri.assumeRolePolicyDocument,
      managedPolicyArns: ri.managedPolicyArns,
      policies: ri.policies,
    });

    if (ri.instanceProfile) {
      const ipi: InstanceProfileInfo = ri.instanceProfile;
      ipi.assign(this, this.createInstanceProfile(ipi, role));
    }

    return role;
  }

  /**
   * InstanceProfile を生成する.
   *
   * @param ipi - 生成する instance-profile の情報を持ったインターフェース
   * @returns 生成した nstance-profile インスタンス
   */
  private createInstanceProfile(ipi: InstanceProfileInfo, role: CfnRole): CfnInstanceProfile {
    return new CfnInstanceProfile(
      this.scope,
      this.createLogicalId(`InstanceProfile-${ipi.originName}`),
      {
        roles: [role.ref],
        instanceProfileName: role.roleName,
      }
    );
  }
}
