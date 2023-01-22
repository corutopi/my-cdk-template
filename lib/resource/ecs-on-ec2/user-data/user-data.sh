#!/bin/bash

# jq インストール
yum -y install jq

# インスタンス名をタグ名に変更
aws ec2 describe-instances \
    --query 'Reservations[].Instances[].{Name:Tags[?Key==`Name`].Value}' \
    --filter "Name=instance-id,Values=`curl -s 'http://169.254.169.254/latest/meta-data/instance-id'`" \
    --region `curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone | sed -e 's/.$//'` \
  | hostnamectl set-hostname `jq -r .[0].Name[0]`

# クラスター指定
echo ECS_CLUSTER='cdktest-dev-test-cluster' >> /etc/ecs/ecs.config
