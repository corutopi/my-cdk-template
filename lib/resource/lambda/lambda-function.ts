import { CfnFunction, CfnAlias, CfnVersion } from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as crypto from 'crypto';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { IamRole } from './iam-role';
import * as cons from '../../constant';

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
  role: string;
  originName: string;
  handler: string;
  runtime: string;
  aliases: AliasInfo[];
  versionComment?: string;
  assign: (cfnFunction: CfnFunction) => void;
}

/**
 * Lambda Function を生成するリソースクラス
 */
export class LambdaFunction extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.lambda.function.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.lambda.function.short;

  public readonly main: CfnFunction;

  private readonly iamRole: IamRole;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        code: {
          s3Bucket: this.context.resourceBucket,
          s3Key: 'test-function.zip',
        },
        role: this.iamRole.testFunction.attrArn,
        originName: 'test',
        handler: 'lambda_function.lambda_handler',
        runtime: 'python3.8',
        aliases: [{ name: 'InService', version: '$LATEST' }],
        versionComment: 'When the version changes, the comments must also change.',
        assign: (cfnFunction) => ((this.main as CfnFunction) = cfnFunction),
      },
    ];
  }

  constructor(parentProps: BaseProps, funcProps: LambdaFunctionProps) {
    super(parentProps);

    this.iamRole = funcProps.iamRole;

    for (const resourceInfo of this.createResourceList()) {
      resourceInfo.assign(this.createFunction(resourceInfo));
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
        role: resourceInfo.role,
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
