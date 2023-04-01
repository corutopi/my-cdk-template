import { CfnApplication } from 'aws-cdk-lib/aws-codedeploy';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import * as cons from '../../constant';

interface ResourceInfo extends BaseInfo {
  readonly assign: (cda: CodeDeployApplication, cfnApp: CfnApplication) => void;
}

/**
 * EcsCluster を生成するリソースクラス
 */
export class CodeDeployApplication extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.codeDeploy.application.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.codeDeploy.application.short;

  public readonly test: CfnApplication;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'test',
        assign: (cda, cfnApp) => ((cda.test as CfnApplication) = cfnApp),
      },
    ];
  }

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createApplication(ri));
    }
  }

  private createApplication(ri: ResourceInfo): CfnApplication {
    return new CfnApplication(this.scope, this.createLogicalId(ri.originName), {
      applicationName: this.createResourceName(ri.originName),
      computePlatform: 'ECS',
    });
  }
}
