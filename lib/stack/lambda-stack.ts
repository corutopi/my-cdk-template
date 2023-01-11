import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IamRole } from '../resource/lambda/iam-role';
import { LambdaFunction } from '../resource/lambda/lambda-function';
import { Logs } from '../resource/lambda/logs';

/**
 * LambdakStack を作成するクラス.
 */
export class LambdakStack extends cdk.Stack {
  public readonly iamRole: IamRole;
  public readonly lambdaFunction: LambdaFunction;
  public readonly logs: Logs;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.iamRole = new IamRole({ scope: this });
    this.lambdaFunction = new LambdaFunction({ scope: this }, { iamRole: this.iamRole });
    this.logs = new Logs({ scope: this }, { lambdaFunction: this.lambdaFunction });
  }
}
