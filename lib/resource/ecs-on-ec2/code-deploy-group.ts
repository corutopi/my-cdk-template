import { CfnDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy';

import { BaseResource, BaseProps } from '../abstruct/base-resource';
import { CodeDeployApplication } from './code-deploy-application';
import { IamRole } from './iam-role';
import { EcsCluster } from './ecs-cluster';
import { EcsService } from './ecs-service';
import { ApplicationLoadBalancer } from './application-load-balancer';
import { TargetGroup } from './target-group';
import * as cons from '../../constant';

interface ResourceProps {
  codeDeployApplication: CodeDeployApplication;
  iamRole: IamRole;
  ecsCluster: EcsCluster;
  ecsService: EcsService;
  alb: ApplicationLoadBalancer;
  tg: TargetGroup;
}

interface ResourceInfo {
  readonly originName: string;
  readonly assign: (cddg: CodeDeployDeploymentGroup, cfnDg: CfnDeploymentGroup) => void;
}

/**
 * EcsCluster を生成するリソースクラス
 */
export class CodeDeployDeploymentGroup extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = cons.SERVICE_NAME.codeDeploy.deploymentGroup.full;
  public readonly SERVICE_SHORT_NAME: string = cons.SERVICE_NAME.codeDeploy.deploymentGroup.short;

  public readonly test: CfnDeploymentGroup;

  private readonly codeDeployApplication: CodeDeployApplication;
  private readonly iamRole: IamRole;
  private readonly ecsCluster: EcsCluster;
  private readonly ecsService: EcsService;
  private readonly alb: ApplicationLoadBalancer;
  private readonly tg: TargetGroup;

  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'test',
      assign: (cddg, cfnDg) => ((cddg.test as CfnDeploymentGroup) = cfnDg),
    },
  ];

  constructor(parentProps: BaseProps, props: ResourceProps) {
    super(parentProps);

    this.codeDeployApplication = props.codeDeployApplication;
    this.ecsCluster = props.ecsCluster;
    this.ecsService = props.ecsService;
    this.iamRole = props.iamRole;
    this.alb = props.alb;
    this.tg = props.tg;

    for (const ri of this.resourceList) {
      ri.assign(this, this.createDeploymentGroup(ri));
    }
  }

  private createDeploymentGroup(ri: ResourceInfo): CfnDeploymentGroup {
    return new CfnDeploymentGroup(this.scope, this.createLogicalId(ri.originName), {
      deploymentGroupName: this.createResourceName(ri.originName),
      applicationName: this.codeDeployApplication.test.applicationName as string,
      deploymentConfigName: 'CodeDeployDefault.ECSAllAtOnce',
      autoRollbackConfiguration: {
        enabled: true,
        events: ['DEPLOYMENT_FAILURE', 'DEPLOYMENT_STOP_ON_REQUEST'],
      },
      deploymentStyle: {
        deploymentType: 'BLUE_GREEN',
        deploymentOption: 'WITH_TRAFFIC_CONTROL',
      },
      outdatedInstancesStrategy: 'UPDATE',
      blueGreenDeploymentConfiguration: {
        deploymentReadyOption: {
          actionOnTimeout: 'STOP_DEPLOYMENT',
          waitTimeInMinutes: 60,
        },
        terminateBlueInstancesOnDeploymentSuccess: {
          action: 'TERMINATE',
          terminationWaitTimeInMinutes: 60,
        },
      },
      serviceRoleArn: this.iamRole.forEcsCodeDeploy.attrArn,
      ecsServices: [
        {
          clusterName: this.ecsCluster.test.clusterName as string,
          serviceName: this.ecsService.test.attrName,
        },
      ],
      loadBalancerInfo: {
        targetGroupPairInfoList: [
          {
            prodTrafficRoute: { listenerArns: [this.alb.testListener80.attrListenerArn] },
            targetGroups: [
              { name: this.tg.test1.attrTargetGroupName },
              { name: this.tg.test2.attrTargetGroupName },
            ],
            testTrafficRoute: { listenerArns: [this.alb.testListener8080.attrListenerArn] },
          },
        ],
      },
    });
  }
}