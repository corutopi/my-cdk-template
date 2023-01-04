import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkStack } from '../../lib/stack/network-stack';

/**
 * テストで使用するテンプレートを生成する.
 *
 * @returns 生成した Template インスタンス
 */
function createTestTemplate(): Template {
  const app = new cdk.App();
  const stack = new NetworkStack(app, 'TestStack');
  const template = Template.fromStack(stack);
  return template;
}

test('Snapshot', () => {
  const template = createTestTemplate();
  const json = template.toJSON();

  expect(json).toMatchSnapshot('NetworkStackSnapshot');
});

test('Vpc', () => {
  const template = createTestTemplate();

  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.10.0.0/16',
    Tags: [{ Key: 'Name', Value: 'cdktest-main-vpc' }],
  });
});

test('Subnet', () => {
  const template = createTestTemplate();

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
  const template = createTestTemplate();

  template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  template.hasResourceProperties('AWS::EC2::InternetGateway', {
    Tags: [{ Key: 'Name', Value: 'cdktest-main-igw' }],
  });
  template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
  template.hasResourceProperties('AWS::EC2::VPCGatewayAttachment', {
    VpcId: { Ref: 'VpcMain' },
    InternetGatewayId: { Ref: 'InternetGatewayMain' },
  });
});

test('RouteTable', () => {
  const template = createTestTemplate();

  template.resourceCountIs('AWS::EC2::RouteTable', 2);
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: { Ref: 'VpcMain' },
    Tags: [{ Key: 'Name', Value: 'cdktest-public-common-rt' }],
  });
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: { Ref: 'VpcMain' },
    Tags: [{ Key: 'Name', Value: 'cdktest-private-common-rt' }],
  });

  template.resourceCountIs('AWS::EC2::Route', 1);
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: { Ref: 'RouteTablePublicCommon' },
    DestinationCidrBlock: '0.0.0.0/0',
    GatewayId: { Ref: 'InternetGatewayMain' },
  });

  template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 4);
  template.hasResourceProperties('AWS::EC2::SubnetRouteTableAssociation', {
    RouteTableId: { Ref: 'RouteTablePublicCommon' },
    SubnetId: { Ref: 'SubnetPublicA' },
  });
  template.hasResourceProperties('AWS::EC2::SubnetRouteTableAssociation', {
    RouteTableId: { Ref: 'RouteTablePublicCommon' },
    SubnetId: { Ref: 'SubnetPublicC' },
  });
  template.hasResourceProperties('AWS::EC2::SubnetRouteTableAssociation', {
    RouteTableId: { Ref: 'RouteTablePrivateCommon' },
    SubnetId: { Ref: 'SubnetPrivateA' },
  });
  template.hasResourceProperties('AWS::EC2::SubnetRouteTableAssociation', {
    RouteTableId: { Ref: 'RouteTablePrivateCommon' },
    SubnetId: { Ref: 'SubnetPrivateC' },
  });
});
