import { CfnApplication } from 'aws-cdk-lib/aws-codedeploy';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

interface ResourceInfo {
  readonly originName: string;
  readonly assign: (cda: CodeDeployApplication, cfnApp: CfnApplication) => void;
}

/**
 * EcsCluster を生成するリソースクラス
 */
export class CodeDeployApplication extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'CodeDeployApplication';
  public readonly SERVICE_SHORT_NAME: string = 'application';

  public readonly test: CfnApplication;

  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'test',
      assign: (cda, cfnApp) => ((cda.test as CfnApplication) = cfnApp),
    },
  ];

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const ri of this.resourceList) {
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
