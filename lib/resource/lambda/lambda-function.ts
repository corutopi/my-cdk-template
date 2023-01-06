import {
  CfnFunction,
  CfnAlias,
  CfnAliasProps,
  CfnVersion,
  CfnFunctionProps,
} from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as crypto from 'crypto';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { IamRole } from './iam-role';

interface LambdaFunctionProps {
  iamRole: IamRole;
}

interface CodeInfo {
  s3Bucket: string;
  s3Key: string;
}

interface AliasInfo {
  name: string;
  version: string;
}

interface ResourceInfo {
  code: CodeInfo;
  role: (role: IamRole) => string;
  originName: string;
  handler: string;
  runtime: string;
  aliases: AliasInfo[];
  versionComment?: string;
  assign: (func: LambdaFunction, cfnFunction: CfnFunction) => void;
}

/**
 * Lambda Function を生成するリソースクラス
 */
export class LambdaFunction extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'lambda-function';
  public readonly SERVICE_SHORT_NAME: string = 'func';

  public readonly main: CfnFunction;

  private readonly iamRole: IamRole;
  private readonly resourceList: ResourceInfo[] = [
    {
      code: {
        s3Bucket: 'ss-test-s3',
        s3Key: 'test-function.zip',
      },
      role: (iamRole) => iamRole.testFunction.attrArn,
      originName: 'test',
      handler: 'lambda_function.lambda_handler',
      runtime: 'python3.8',
      aliases: [
        {
          name: 'InService',
          version: '$LATEST',
        },
      ],
      versionComment: 'バージョンが変わる場合は必ずコメントも変わるものとする.',
      assign: (func, cfnFunction) => ((func.main as CfnFunction) = cfnFunction),
    },
  ];

  constructor(parentProps: BaseProps, funcProps: LambdaFunctionProps) {
    super(parentProps);

    this.iamRole = funcProps.iamRole;

    for (const resourceInfo of this.resourceList) {
      resourceInfo.assign(this, this.createFunction(resourceInfo));
    }
  }

  /**
   * Lambda Function を生成する.
   *
   * @param resourceInfo - 生成するLambdaFunctionの情報を持ったインターフェース
   * @returns 生成したLambdaFunctionインスタンス
   */
  private createFunction(resourceInfo: ResourceInfo): CfnFunction {
    const cfnFunction: CfnFunction = new CfnFunction(
      this.scope,
      this.createLogicalId(resourceInfo.originName),
      {
        code: {
          s3Bucket: resourceInfo.code.s3Bucket,
          s3Key: resourceInfo.code.s3Key,
        },
        role: resourceInfo.role(this.iamRole),
        functionName: this.createResourceName(resourceInfo.originName),
        handler: resourceInfo.handler,
        runtime: resourceInfo.runtime,
      }
    );

    for (const aliasInfo of resourceInfo.aliases) {
      const alias = new CfnAlias(
        this.scope,
        this.createLogicalId(`${resourceInfo.originName}-alias-${aliasInfo.name}`),
        {
          functionName: cfnFunction.functionName as string,
          name: aliasInfo.name,
          functionVersion: aliasInfo.version,
        }
      );
      alias.addDependsOn(cfnFunction);
    }

    if (resourceInfo.versionComment !== undefined) {
      const c = crypto.createHash('md5').update(resourceInfo.versionComment).digest('hex');
      const version = new CfnVersion(
        this.scope,
        this.createLogicalId(`${resourceInfo.originName}-version-${c}`),
        {
          functionName: cfnFunction.functionName as string,
          description: resourceInfo.versionComment,
        }
      );
      version.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
      version.addDependsOn(cfnFunction);
    }

    return cfnFunction;
  }
}
