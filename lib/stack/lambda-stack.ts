import { BaseStack, BaseStackProps } from './abstruct/base-stack';
import { IamRole } from '../resource/lambda/iam-role';
import { LambdaFunction } from '../resource/lambda/lambda-function';
import { Logs } from '../resource/lambda/logs';

/**
 * LambdakStack を作成するクラス.
 */
export class LambdakStack extends BaseStack {
  public readonly iamRole: IamRole;
  public readonly lambdaFunction: LambdaFunction;
  public readonly logs: Logs;

  constructor(parentProps: BaseStackProps) {
    super(parentProps);

    this.iamRole = new IamRole({ scope: this });
    this.lambdaFunction = new LambdaFunction({ scope: this }, { iamRole: this.iamRole });
    this.logs = new Logs({ scope: this }, { lambdaFunction: this.lambdaFunction });
  }
}
