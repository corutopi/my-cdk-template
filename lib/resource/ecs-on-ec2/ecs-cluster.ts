import { CfnCluster } from 'aws-cdk-lib/aws-ecs';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import * as cons from '../../constant';

interface ResourceInfo extends BaseInfo {
  readonly containerInsights: 'enabled' | 'disabled';
  readonly assign: (cluster: EcsCluster, cfnCluster: CfnCluster) => void;
}

/**
 * EcsCluster を生成するリソースクラス
 */
export class EcsCluster extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ecs.cluster.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ecs.cluster.short;

  public readonly test: CfnCluster;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'test',
        containerInsights: 'enabled',
        assign: (cluster, cfnCluster) => ((cluster.test as CfnCluster) = cfnCluster),
      },
    ];
  }

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createCluster(ri));
    }
  }

  private createCluster(ri: ResourceInfo): CfnCluster {
    return new CfnCluster(this.scope, this.createLogicalId(ri.originName), {
      clusterName: this.createResourceName(ri.originName),
      clusterSettings: [{ name: 'containerInsights', value: ri.containerInsights }],
    });
  }
}
