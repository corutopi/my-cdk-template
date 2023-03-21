import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';

import { EcsOnEc2Stack } from '../../lib/stack/ecs-on-ec2-stack';
import { NetworkStack } from '../../lib/stack/network-stack';
import * as tc from '../test-constant';

/**
 * テストで使用するテンプレートを生成する.
 *
 * @returns 生成した Template インスタンス
 */
function createTestTemplate(): Template {
  const app = new cdk.App({ context: tc.CONTEXT });
  const networkStack = new NetworkStack({ scope: app, id: 'network' });
  const stack = new EcsOnEc2Stack(app, 'TestStack', networkStack);
  const template = Template.fromStack(stack);
  return template;
}

test('Snapshot', () => {
  const template = createTestTemplate();
  const json = template.toJSON();

  expect(json).toMatchSnapshot('LambdaStackSnapshot');
});
