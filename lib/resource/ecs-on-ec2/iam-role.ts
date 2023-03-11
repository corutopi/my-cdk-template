import {
  CfnRole,
  CfnInstanceProfile,
  PolicyStatement,
  PolicyStatementProps,
  ServicePrincipal,
  PolicyDocument,
  Effect,
} from 'aws-cdk-lib/aws-iam';
import * as cons from '../../constant';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

/**
 * InstanceProfile 生成に必要な情報を持つインターフェース
 */
interface InstanceProfileInfo {
  originName: string;
  assign: (role: IamRole, cfnIp: CfnInstanceProfile) => void;
}

/**
 * IamRole 生成に必要な情報を持つインターフェース
 */
interface ResourceInfo {
  originName: string;
  policyStatementProps: PolicyStatementProps;
  managedPolicyArns: string[];
  policies?: CfnRole.PolicyProperty[];
  instanceProfile?: InstanceProfileInfo;
  assign: (role: IamRole, iamRole: CfnRole) => void;
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

  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'for-ecs',
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('ec2.amazonaws.com')],
        actions: ['sts:AssumeRole'],
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
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('codedeploy.amazonaws.com')],
        actions: ['sts:AssumeRole'],
      },
      managedPolicyArns: ['arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS'],
      assign: (role, iamRole) => ((role.forEcsCodeDeploy as CfnRole) = iamRole),
    },
  ];

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const resourceInfo of this.resourceList) {
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
      assumeRolePolicyDocument: new PolicyDocument({
        statements: [new PolicyStatement(ri.policyStatementProps)],
      }),
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
