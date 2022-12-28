import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkStack } from '../../lib/stack/network-stack';

test('Snapshot', () => {
  const app = new cdk.App();
  const stack = new NetworkStack(app, 'TestStack');
  const template = Template.fromStack(stack);
  const json = template.toJSON();

  expect(json).toMatchSnapshot('NetworkStackSnapshot');
});

test('Vpc', () => {
  const app = new cdk.App();
  const stack = new NetworkStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.10.0.0/16',
    Tags: [{ Key: 'Name', Value: 'main-vpc' }],
  });
});
