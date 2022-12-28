import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as constant from '../../constant';

export interface BaseProps {
  readonly scope: Construct;
}

export abstract class BaseResource {
  abstract readonly SERVICE_NAME: string;

  protected readonly scope: Construct;
  protected readonly context: object;

  constructor(baseProps: BaseProps) {
    this.scope = baseProps.scope;
    this.context = this.scope.node.tryGetContext;
  }

  protected createNameTagProps(originName: string): cdk.CfnTag {
    return { key: 'Name', value: this.createResourceName(originName) };
  }

  protected createResourceName(originName: string): string {
    return `${constant.SYSTEM_NAME}-${originName}-${this.SERVICE_NAME}`;
  }
}
