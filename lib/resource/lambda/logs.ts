import { CfnLogGroup } from 'aws-cdk-lib/aws-logs';
import * as cdk from 'aws-cdk-lib';
import * as crypto from 'crypto';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { LambdaFunction  } from './lambda-function'

interface LogsProps {
  lambdaFunction: LambdaFunction 
}

interface ResourceInfo {
  originName: string;
  functionName: (lf: LambdaFunction) => string;
  retentionInDays: number;
  assign: (logs: Logs, cfnLogGroup: CfnLogGroup) => void;
}

/**
 * Logs を生成するリソースクラス
 */
export class Logs extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'logs';
  public readonly SERVICE_SHORT_NAME: string = 'logs';

  public readonly main: CfnLogGroup;
  
  private readonly lambdaFunction: LambdaFunction;
  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'main',
      functionName: (lf) => lf.main.functionName as string,
      retentionInDays: 90,
      assign: (logs, cfnLogGroup) => (logs.main as CfnLogGroup) = cfnLogGroup
    },
  ];

  constructor(parentProps: BaseProps, logsProps: LogsProps) {
    super(parentProps);
    
    this.lambdaFunction = logsProps.lambdaFunction
    
    for (const resourceInfo of this.resourceList) {
      resourceInfo.assign(this, this.createLogGroup(resourceInfo));
    }
  }

  /**
   * Lambda Function を生成する.
   *
   * @param resourceInfo - 生成するLambdaFunctionの情報を持ったインターフェース
   * @returns 生成したLambdaFunctionインスタンス
   */
  private createLogGroup(resourceInfo: ResourceInfo): CfnLogGroup {
    // const functionName = ${resourceInfo.functionName()}
    return new CfnLogGroup(this.scope, this.createLogicalId(resourceInfo.originName), {
      logGroupName: `/aws/lambda/${resourceInfo.functionName(this.lambdaFunction)}`,
      retentionInDays: resourceInfo.retentionInDays
    })
  }
}
