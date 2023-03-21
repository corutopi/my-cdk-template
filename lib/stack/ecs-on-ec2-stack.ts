import { BaseStack, BaseStackProps } from './abstruct/base-stack';
import { IamRole } from '../resource/ecs-on-ec2/iam-role';
import { SecurityGroup } from '../resource/ecs-on-ec2/security-group';
import { Instance } from '../resource/ecs-on-ec2/ec2-instance';
import { EcsCluster } from '../resource/ecs-on-ec2/ecs-cluster';
import { TaskDefinition } from '../resource/ecs-on-ec2/task-definition';
import { ApplicationLoadBalancer } from '../resource/ecs-on-ec2/application-load-balancer';
import { TargetGroup } from '../resource/ecs-on-ec2/target-group';
import { EcsService } from '../resource/ecs-on-ec2/ecs-service';
import { CodeDeployApplication } from '../resource/ecs-on-ec2/code-deploy-application';
import { CodeDeployDeploymentGroup } from '../resource/ecs-on-ec2/code-deploy-group';
import { NetworkStack } from '../stack/network-stack';

interface StackProps {
  readonly networkStack: NetworkStack;
}

/**
 * EcsOnEc2Stack を作成するクラス.
 */
export class EcsOnEc2Stack extends BaseStack {
  public readonly role: IamRole;
  public readonly sg: SecurityGroup;
  public readonly ins: Instance;
  public readonly cluster: EcsCluster;
  public readonly task: TaskDefinition;
  public readonly tg: TargetGroup;
  public readonly alb: ApplicationLoadBalancer;
  public readonly service: EcsService;
  public readonly application: CodeDeployApplication;
  public readonly deploymentGroup: CodeDeployDeploymentGroup;

  constructor(parentProps: BaseStackProps, stackProps: StackProps) {
    super(parentProps);
    this.role = new IamRole({ scope: this });
    this.sg = new SecurityGroup({ scope: this }, { vpc: stackProps.networkStack.vpc });
    this.cluster = new EcsCluster({ scope: this });
    this.task = new TaskDefinition({ scope: this });
    this.ins = new Instance(
      { scope: this },
      {
        role: this.role,
        sg: this.sg,
        subnet: stackProps.networkStack.subnet,
        cluster: this.cluster,
      }
    );
    this.tg = new TargetGroup({ scope: this }, { vpc: stackProps.networkStack.vpc });
    this.alb = new ApplicationLoadBalancer(
      { scope: this },
      { subnet: stackProps.networkStack.subnet, sg: this.sg, tg: this.tg }
    );
    this.service = new EcsService(
      { scope: this },
      { tg: this.tg, alb: this.alb, cluster: this.cluster }
    );
    this.application = new CodeDeployApplication({ scope: this });
    this.deploymentGroup = new CodeDeployDeploymentGroup(
      { scope: this },
      {
        alb: this.alb,
        codeDeployApplication: this.application,
        ecsCluster: this.cluster,
        ecsService: this.service,
        iamRole: this.role,
        tg: this.tg,
      }
    );
  }
}
