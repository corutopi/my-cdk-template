import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';

import { LambdakStack } from '../../lib/stack/lambda-stack';
import * as tc from '../test-constant';

/**
 * テストで使用するテンプレートを生成する.
 *
 * @returns 生成した Template インスタンス
 */
function createTestTemplate(): Template {
  const app = new cdk.App({ context: tc.CONTEXT });
  const stack = new LambdakStack({ id: 'lambda', scope: app });
  const template = Template.fromStack(stack);
  return template;
}

test('Snapshot', () => {
  const template = createTestTemplate();
  const json = template.toJSON();

  expect(json).toMatchSnapshot('LambdaStackSnapshot');
});

test('IamRole', () => {
  const template = createTestTemplate();

  template.resourceCountIs('AWS::IAM::Role', 1);
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
    RoleName: 'cdktest-dev-test-function-role',
  });
});

test('LambdaFunction', () => {
  const template = createTestTemplate();

  template.resourceCountIs('AWS::Lambda::Function', 1);
  template.hasResourceProperties('AWS::Lambda::Function', {
    Code: {
      S3Bucket: 'resourceBucket',
      S3Key: 'test-function.zip',
    },
    Role: {
      'Fn::GetAtt': ['IamRoleTestFunction', 'Arn'],
    },
    FunctionName: 'cdktest-dev-test-func',
    Handler: 'lambda_function.lambda_handler',
    Runtime: 'python3.8',
  });
  template.resourceCountIs('AWS::Lambda::Alias', 1);
  template.hasResourceProperties('AWS::Lambda::Alias', {
    FunctionName: 'cdktest-dev-test-func',
    FunctionVersion: '$LATEST',
    Name: 'InService',
  });
  template.resourceCountIs('AWS::Lambda::Version', 1);
  template.hasResource('AWS::Lambda::Version', {
    Properties: {
      FunctionName: 'cdktest-dev-test-func',
      Description: Match.anyValue(),
    },
    DependsOn: ['LambdaFunctionTest'],
    UpdateReplacePolicy: 'Retain',
    DeletionPolicy: 'Retain',
  });
  const f = template.findResources('AWS::Lambda::Version', {
    Properties: {
      FunctionName: 'cdktest-dev-test-func',
      Description: Match.anyValue(),
    },
    DependsOn: ['LambdaFunctionTest'],
    UpdateReplacePolicy: 'Retain',
    DeletionPolicy: 'Retain',
  });
});

test('Logs', () => {
  const template = createTestTemplate();

  template.resourceCountIs('AWS::Logs::LogGroup', 1);
  template.hasResourceProperties('AWS::Logs::LogGroup', {
    LogGroupName: '/aws/lambda/cdktest-dev-test-func',
    RetentionInDays: 90,
  });
});
