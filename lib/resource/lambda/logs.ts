import { CfnLogGroup } from 'aws-cdk-lib/aws-logs';
import * as cons from '../../constant';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { LambdaFunction } from './lambda-function';

interface LogsProps {
  lambdaFunction: LambdaFunction;
}

interface ResourceInfo {
  originName: string;
  functionName: string;
  retentionInDays: number;
  assign: (cfnLogGroup: CfnLogGroup) => void;
}

/**
 * Logs を生成するリソースクラス
 */
export class Logs extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.cloudWatch.logs.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.cloudWatch.logs.short;

  public readonly main: CfnLogGroup;

  private readonly lambdaFunction: LambdaFunction;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'main',
        functionName: this.lambdaFunction.main.functionName as string,
        retentionInDays: 90,
        assign: (cfnLogGroup) => ((this.main as CfnLogGroup) = cfnLogGroup),
      },
    ];
  }

  constructor(parentProps: BaseProps, logsProps: LogsProps) {
    super(parentProps);

    this.lambdaFunction = logsProps.lambdaFunction;

    for (const resourceInfo of this.createResourceList()) {
      resourceInfo.assign(this.createLogGroup(resourceInfo));
    }
  }

  /**
   * Lambda Function を生成する.
   *
   * @param resourceInfo - 生成するLambdaFunctionの情報を持ったインターフェース
   * @returns 生成したLambdaFunctionインスタンス
   */
  private createLogGroup(resourceInfo: ResourceInfo): CfnLogGroup {
    return new CfnLogGroup(this.scope, this.createLogicalId(resourceInfo.originName), {
      logGroupName: `/aws/lambda/${resourceInfo.functionName}`,
      retentionInDays: resourceInfo.retentionInDays,
    });
  }
}
