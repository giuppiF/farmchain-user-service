#!/bin/sh
echo "Deploy $SERVICE_NAME to ECS"
aws ecs update-service --force-new-deployment --cluster farmchain-cluster --service $SERVICE_NAME --region eu-west-1
