export const SYSTEM_NAME = 'cdktest';

/**
 * cdk.json::context で定義する内容と同じ構成の構造体
 */
export interface ContextProperty {
  resourceBucket: string;
}

/**
 * AWSサービスのフル名と短縮名定義
 */
export const SERVICE_NAME = {
  codeDeploy: {
    application: { full: 'CodeDeployApplication', short: 'application' },
    deploymentGroup: { full: 'CodeDeployDeploymentGroup', short: 'group' },
  },
  ec2: {
    instance: { full: 'EC2Instance', short: 'ins' },
    vpc: { full: 'Vpc', short: 'vpc' },
    subnet: { full: 'Subnet', short: 'subnet' },
    routeTable: { full: 'RouteTable', short: 'rt' },
    internetGateway: { full: 'InternetGateway', short: 'igw' },
    secrityGroup: { full: 'SecurityGroup', short: 'sg' },
  },
  ecs: {
    cluster: { full: 'EcsCluster', short: 'cluster' },
    service: { full: 'EcsService', short: 'service' },
    taskDefinition: { full: 'EcsTaskDefinition', short: 'task' },
  },
  elb: {
    alb: { full: 'ApplicationLoadBalancer', short: 'alb' },
    targetGroup: { full: 'TargetGroup', short: 'tg' },
  },
  iam: {
    role: { full: 'IamRole', short: 'role' },
  },
  lambda: {
    function: { full: ' LambdaFunction', short: 'func' },
  },
  cloudWatch: {
    logs: { full: 'CloudWatchLogs', short: 'logs' },
  },
};
