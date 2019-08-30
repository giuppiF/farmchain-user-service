#!/bin/sh
echo "Login to ECR Repository"
$(aws ecr get-login --no-include-email --region eu-west-1)
echo "Preparation task"
echo "Build Docker Image for $SERVICE_NAME"
docker build -t $SERVICE_NAME -f Dockerfile.prod .
echo "Push to $SERVICE_NAME to ECR Repository"
docker tag $SERVICE_NAME:latest $AWS_ECR_REPOSITORY/$SERVICE_NAME:latest
docker push $AWS_ECR_REPOSITORY/$SERVICE_NAME:latest