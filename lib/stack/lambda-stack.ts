import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IamRole } from '../resource/lambda/iam-role';
import { LambdaFunction } from '../resource/lambda/lambda-function';

/**
 * LambdakStack を作成するクラス.
 */
export class LambdakStack extends cdk.Stack {
  public readonly iamRole: IamRole;
  public readonly lambdaFunction: LambdaFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.iamRole = new IamRole({ scope: this });
    this.lambdaFunction = new LambdaFunction({ scope: this }, { iamRole: this.iamRole });
  }
}
