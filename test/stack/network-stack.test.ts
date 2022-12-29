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
    Tags: [{ Key: 'Name', Value: 'cdktest-main-vpc' }],
  });
});

test('Subnet', () => {
  const app = new cdk.App();
  const stack = new NetworkStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::Subnet', 4);
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.10.1.0/24',
    VpcId: { Ref: 'VpcMain' },
    Tags: [{ Key: 'Name', Value: 'cdktest-public-a-subnet' }],
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.10.2.0/24',
    VpcId: { Ref: 'VpcMain' },
    Tags: [{ Key: 'Name', Value: 'cdktest-public-c-subnet' }],
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.10.11.0/24',
    VpcId: { Ref: 'VpcMain' },
    Tags: [{ Key: 'Name', Value: 'cdktest-private-a-subnet' }],
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.10.12.0/24',
    VpcId: { Ref: 'VpcMain' },
    Tags: [{ Key: 'Name', Value: 'cdktest-private-c-subnet' }],
  });
});

test('InternetGateway', () => {
  const app = new cdk.App();
  const stack = new NetworkStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  template.hasResourceProperties('AWS::EC2::InternetGateway', {
    Tags: [{ Key: 'Name', Value: 'cdktest-main-internet-gateway' }],
  });
  template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
  template.hasResourceProperties('AWS::EC2::VPCGatewayAttachment', {
    VpcId: { Ref: 'VpcMain' },
    InternetGatewayId: { Ref: 'InternetGatewayMain' },
  });
});
