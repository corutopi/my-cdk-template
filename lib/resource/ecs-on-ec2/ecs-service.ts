import { CfnService } from 'aws-cdk-lib/aws-ecs';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { TargetGroup } from './target-group';
import { EcsCluster } from './ecs-cluster';
import { ApplicationLoadBalancer } from './application-load-balancer';
import * as cons from '../../constant';

interface ResourceProps {
  readonly tg: TargetGroup;
  readonly alb: ApplicationLoadBalancer;
  readonly cluster: EcsCluster;
}

interface ResourceInfo {
  readonly originName: string;
  readonly assign: (service: EcsService, cfnService: CfnService) => void;
}

/**
 * EcsCluster を生成するリソースクラス
 */
export class EcsService extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.ecs.service.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.ecs.service.short;

  public readonly test: CfnService;

  private readonly tg: TargetGroup;
  private readonly alb: ApplicationLoadBalancer;
  private readonly cluster: EcsCluster;

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'test',
        assign: (service, cfnService) => ((service.test as CfnService) = cfnService),
      },
    ];
  }

  constructor(parentProps: BaseProps, props: ResourceProps) {
    super(parentProps);

    this.tg = props.tg;
    this.alb = props.alb;
    this.cluster = props.cluster;

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createEcsService(ri));
    }
  }

  private createEcsService(ri: ResourceInfo): CfnService {
    const service = new CfnService(this.scope, this.createLogicalId(ri.originName), {
      serviceName: 'test-service-2',
      cluster: this.cluster.test.attrArn,
      desiredCount: 1,
      loadBalancers: [
        {
          containerPort: 80,
          targetGroupArn: this.tg.test1.ref,
          containerName: 'httpd-test',
        },
      ],
      deploymentController: {
        type: 'CODE_DEPLOY',
      },
      taskDefinition: 'cdktest-dev-test-task:6',
    });

    service.addDependsOn(this.alb.test);
    service.addDependsOn(this.alb.testListener80);
    service.addDependsOn(this.alb.testListener8080);

    return service;
  }
}
