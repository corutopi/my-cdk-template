import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as constant from '../../constant';

/**
 * BaseResource クラスの引数用インターフェース.
 */
export interface BaseProps {
  readonly scope: Construct;
}

/**
 * リソースクラスで継承する抽象クラス.
 */
export abstract class BaseResource {
  abstract readonly SERVICE_FULL_NAME: string;
  abstract readonly SERVICE_SHORT_NAME: string;

  protected readonly scope: Construct;
  protected readonly env: string;
  protected readonly context: object;

  constructor(baseProps: BaseProps) {
    this.scope = baseProps.scope;
    this.env = this.scope.node.tryGetContext('env');
    this.context = this.scope.node.tryGetContext(this.env);
  }

  /**
   * Name タグのタグインターフェースを生成する.
   *
   * @param originName - Name タグ生成に使用する識別子.
   * @returns Name タグオブジェクト.
   */
  protected createNameTagProps(originName: string): cdk.CfnTag {
    return { key: 'Name', value: this.createResourceName(originName) };
  }

  /**
   * リソース名を生成する.
   *
   * @param originName - リソース名生成に使用する識別子.
   * @returns リソース名.
   */
  protected createResourceName(originName: string): string {
    return `${constant.SYSTEM_NAME}-${this.env}-${originName}-${this.SERVICE_SHORT_NAME}`;
  }

  /**
   * CloudFormationで使用することを想定した論理IDを生成する.
   *
   * @remarks
   * CloudFormationで論理IDとして使用される場合 '_', '-' は削除して連結される.
   * そのためUpperCamelCaseに変換している.
   *
   * @param originName - 論理ID生成に使用する識別子.
   * @returns 論理ID.
   */
  protected createLogicalId(originName: string): string {
    return this.convertUpperCamelCase(`${this.SERVICE_FULL_NAME}-${originName}`);
  }

  /**
   * 文字列をアッパーキャメルケースに変換する.
   *
   * @remarks
   * 以下に該当する文字列又はこれらの文字列が連結された文字列を引数として想定している.
   *    snake-case, kebab-case
   *
   * @param target - 変換対象文字列.
   * @returns 変換後の文字列.
   */
  protected convertUpperCamelCase(target: string): string {
    let re: string = '';
    let upFlg: boolean = true;
    for (let i = 0; i < target.length; i++) {
      if (target[i] === '-' || target[i] === '_') {
        upFlg = true;
        continue;
      }
      re += upFlg ? target[i].toUpperCase() : target[i];
      upFlg = false;
    }
    return re;
  }
}
