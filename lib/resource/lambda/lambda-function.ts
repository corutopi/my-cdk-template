import { CfnFunction, CfnAlias, CfnVersion, CfnFunctionProps } from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as crypto from 'crypto';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { IamRole } from './iam-role';

interface LambdaFunctionProps {
  iamRole: IamRole;
}

/**
 * Lambda Function を生成するリソースクラス
 */
export class LambdaFunction extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'lambda-function';
  public readonly SERVICE_SHORT_NAME: string = 'func';

  public readonly main: CfnFunction;
  private readonly iamRole: IamRole;

  constructor(parentProps: BaseProps, funcProps: LambdaFunctionProps) {
    super(parentProps);

    this.iamRole = funcProps.iamRole;

    const fp: CfnFunctionProps = {
      code: {
        s3Bucket: 'ss-test-s3',
        s3Key: 'test-function.zip',
      },
      role: this.iamRole.testFunction.attrArn,
      functionName: this.createResourceName('test'),
      handler: 'lambda_function.lambda_handler',
      runtime: 'python3.8',
    };

    this.main = new CfnFunction(this.scope, this.createLogicalId('test'), fp);
    const alias = new CfnAlias(this.scope, this.createLogicalId('test-alias'), {
      functionName: this.main.functionName as string,
      functionVersion: '$LATEST',
      name: 'InService',
    });
    alias.addDependsOn(this.main);

    const comment: string = 'バージョンが変わる場合は必ずコメントも変わるものとする.';
    const version = new CfnVersion(
      this.scope,
      this.createLogicalId('version-' + crypto.createHash('md5').update(comment).digest('hex')),
      {
        functionName: this.main.functionName as string,
        description: comment,
      }
    );
    version.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    version.addDependsOn(this.main);
  }
}
