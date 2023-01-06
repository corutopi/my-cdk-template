import {
  CfnRole,
  PolicyStatement,
  PolicyStatementProps,
  ServicePrincipal,
  PolicyDocument,
  PolicyDocumentProps,
  Effect,
} from 'aws-cdk-lib/aws-iam';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

/**
 * IamRole 生成に必要な情報を持つインターフェース
 */
interface ResourceInfo {
  originName: string;
  policyStatementProps: PolicyStatementProps;
  managedPolicyArns: string[];
  assign: (role: IamRole, iamRole: CfnRole) => void;
}

/**
 * IamRole を生成するリソースクラス
 */
export class IamRole extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'iam-role';
  public readonly SERVICE_SHORT_NAME: string = 'role';

  public readonly testFunction: CfnRole;

  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'test-function',
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('lambda.amazonaws.com')],
        actions: ['sts:AssumeRole'],
      },
      managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
      assign: (role, iamRole) => ((role.testFunction as CfnRole) = iamRole),
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
   * @param resourceInfo - 生成するiam-roleの情報を持ったインターフェース
   * @returns 生成したiam-roleインスタンス
   */
  private createIamRole(resourceInfo: ResourceInfo): CfnRole {
    return new CfnRole(this.scope, this.createLogicalId(resourceInfo.originName), {
      roleName: this.createResourceName(resourceInfo.originName),
      assumeRolePolicyDocument: new PolicyDocument({
        statements: [new PolicyStatement(resourceInfo.policyStatementProps)],
      }),
      managedPolicyArns: resourceInfo.managedPolicyArns,
    });
  }
}
