import { CfnDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy';

import { BaseResource, BaseProps, BaseInfo } from '../abstruct/base-resource';
import { CodeDeployApplication } from './code-deploy-application';
import { IamRole } from './iam-role';
import { EcsCluster } from './ecs-cluster';
import { EcsService } from './ecs-service';
import { ApplicationLoadBalancer } from './application-load-balancer';
import { TargetGroup } from './target-group';
import * as cons from '../../constant';

interface ResourceProps {
  readonly codeDeployApplication: CodeDeployApplication;
  readonly iamRole: IamRole;
  readonly ecsCluster: EcsCluster;
  readonly ecsService: EcsService;
  readonly alb: ApplicationLoadBalancer;
  readonly tg: TargetGroup;
}

interface ResourceInfo extends BaseInfo {
  readonly applicationName: string;
  readonly deploymentConfigName: 'CodeDeployDefault.ECSAllAtOnce';
  readonly autoRollbackConfiguration: CfnDeploymentGroup.AutoRollbackConfigurationProperty;
  readonly deploymentStyle: CfnDeploymentGroup.DeploymentStyleProperty;
  readonly outdatedInstancesStrategy: 'UPDATE';
  readonly blueGreenDeploymentConfiguration: CfnDeploymentGroup.BlueGreenDeploymentConfigurationProperty;
  readonly serviceRoleArn: string;
  readonly ecsServices: CfnDeploymentGroup.ECSServiceProperty[];
  readonly loadBalancerInfo: CfnDeploymentGroup.LoadBalancerInfoProperty;
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

  protected createResourceList(): ResourceInfo[] {
    return [
      {
        originName: 'test',
        applicationName: this.codeDeployApplication.test.applicationName as string,
        deploymentConfigName: 'CodeDeployDefault.ECSAllAtOnce',
        autoRollbackConfiguration: {
          enabled: true,
          events: ['DEPLOYMENT_FAILURE', 'DEPLOYMENT_STOP_ON_REQUEST'],
        },
        deploymentStyle: { deploymentType: 'BLUE_GREEN', deploymentOption: 'WITH_TRAFFIC_CONTROL' },
        outdatedInstancesStrategy: 'UPDATE',
        blueGreenDeploymentConfiguration: {
          deploymentReadyOption: { actionOnTimeout: 'STOP_DEPLOYMENT', waitTimeInMinutes: 60 },
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
        assign: (cddg, cfnDg) => ((cddg.test as CfnDeploymentGroup) = cfnDg),
      },
    ];
  }

  constructor(parentProps: BaseProps, props: ResourceProps) {
    super(parentProps);

    this.codeDeployApplication = props.codeDeployApplication;
    this.ecsCluster = props.ecsCluster;
    this.ecsService = props.ecsService;
    this.iamRole = props.iamRole;
    this.alb = props.alb;
    this.tg = props.tg;

    for (const ri of this.createResourceList()) {
      ri.assign(this, this.createDeploymentGroup(ri));
    }
  }

  private createDeploymentGroup(ri: ResourceInfo): CfnDeploymentGroup {
    return new CfnDeploymentGroup(this.scope, this.createLogicalId(ri.originName), {
      deploymentGroupName: this.createResourceName(ri.originName),
      applicationName: ri.applicationName,
      deploymentConfigName: ri.deploymentConfigName,
      autoRollbackConfiguration: ri.autoRollbackConfiguration,
      deploymentStyle: ri.deploymentStyle,
      outdatedInstancesStrategy: ri.outdatedInstancesStrategy,
      blueGreenDeploymentConfiguration: ri.blueGreenDeploymentConfiguration,
      serviceRoleArn: ri.serviceRoleArn,
      ecsServices: ri.ecsServices,
      loadBalancerInfo: ri.loadBalancerInfo,
    });
  }
}
