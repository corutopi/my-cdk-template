import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cons from '../../constant';

export interface BaseStackProps {
  readonly scope: Construct;
  readonly id: string;
}

/**
 * スタッククラスで継承する抽象クラス
 */
export class BaseStack extends cdk.Stack {
  constructor(baseProps: BaseStackProps) {
    super(baseProps.scope, baseProps.id, {
      stackName: createStackName(baseProps.scope.node.tryGetContext('stage'), baseProps.id),
    });
  }
}

/**
 * スタック名を生成する
 */
function createStackName(stage: string, id: string): string {
  return `${cons.SYSTEM_NAME}-${stage}-${id}-${cons.SERVICE_NAME.cloudFromation.stack.short}`;
}
