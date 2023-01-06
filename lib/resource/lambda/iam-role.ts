import { CfnRole, PolicyStatement, PolicyDocument } from 'aws-cdk-lib/aws-iam';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

/**
 * Iam Role を生成するリソースクラス
 */
export class IamRole extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'iam-role';
  public readonly SERVICE_SHORT_NAME: string = 'role';

  public readonly testFunction: CfnRole;

  constructor(parentProps: BaseProps) {
    super(parentProps);
    const json = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    };

    const policyDocment = PolicyDocument.fromJson(json);

    this.testFunction = new CfnRole(this.scope, this.createLogicalId('test-function'), {
      roleName: this.createResourceName('test-function'),
      assumeRolePolicyDocument: policyDocment,
      managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
    });
  }
}
