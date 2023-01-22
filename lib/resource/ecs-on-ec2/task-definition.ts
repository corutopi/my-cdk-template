import { CfnTaskDefinition } from 'aws-cdk-lib/aws-ecs';

import { BaseResource, BaseProps } from '../abstruct/base-resource';

interface ResourceInfo {
  readonly originName: string;
  readonly containerDefinitions: CfnTaskDefinition.ContainerDefinitionProperty[];
  readonly assign: (task: TaskDefinition, cfnTask: CfnTaskDefinition) => void;
}

/**
 * EcsCluster を生成するリソースクラス
 */
export class TaskDefinition extends BaseResource {
  public readonly SERVICE_FULL_NAME: string = 'task-definition';
  public readonly SERVICE_SHORT_NAME: string = 'task';

  public readonly test: CfnTaskDefinition;

  private readonly resourceList: ResourceInfo[] = [
    {
      originName: 'test',
      containerDefinitions: [
        {
          name: 'httpd-test',
          image: 'httpd:2.4',
          command: [
            '/bin/sh -c "echo \'<html> <head> <title>Amazon ECS Sample App</title> <style>body {margin-top: 40px; background-color: #333;} </style> </head><body> <div style=color:white;text-align:center> <h1>Amazon ECS Sample App</h1> <h2>Congratulations!</h2> <p>Your application is now running on a container in Amazon ECS.</p> </div></body></html>\' >  /usr/local/apache2/htdocs/index.html && httpd-foreground"',
          ],
          portMappings: [
            {
              hostPort: 0,
              protocol: 'tcp',
              containerPort: 80,
            },
          ],
          memoryReservation: 128,
          entryPoint: ['sh', '-c'],
        },
      ],
      assign: (task, cfnTask) => ((task.test as CfnTaskDefinition) = cfnTask),
    },
  ];

  constructor(parentProps: BaseProps) {
    super(parentProps);

    for (const ri of this.resourceList) {
      ri.assign(this, this.createTaskDefinition(ri));
    }
  }

  private createTaskDefinition(ri: ResourceInfo): CfnTaskDefinition {
    return new CfnTaskDefinition(this.scope, this.createLogicalId(ri.originName), {
      containerDefinitions: ri.containerDefinitions,
      family: this.createResourceName(ri.originName),
    });
  }
}
