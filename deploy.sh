#!/bin/bash

# Build and Deploy Script for theobroma-digital
# This script builds the Docker image and pushes it to AWS ECR

set -e

# Configuration
PROJECT_NAME="theobroma-digital"
AWS_REGION="us-west-2"  # Update this to match your Terraform configuration
ENVIRONMENT="${1:-staging}"  # Default to staging, can override with argument

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building and deploying ${PROJECT_NAME} to ${ENVIRONMENT}...${NC}"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend"

echo -e "${YELLOW}ECR Repository: ${ECR_REPOSITORY}${NC}"

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY}

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${PROJECT_NAME}-frontend .

# Tag for ECR
IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
docker tag ${PROJECT_NAME}-frontend:latest ${ECR_REPOSITORY}:${IMAGE_TAG}
docker tag ${PROJECT_NAME}-frontend:latest ${ECR_REPOSITORY}:latest

# Push to ECR
echo -e "${YELLOW}Pushing to ECR...${NC}"
docker push ${ECR_REPOSITORY}:${IMAGE_TAG}
docker push ${ECR_REPOSITORY}:latest

# Force ECS service update
echo -e "${YELLOW}Updating ECS service...${NC}"
aws ecs update-service \
    --cluster "myapp-${ENVIRONMENT}-cluster" \
    --service "myapp-${ENVIRONMENT}-frontend" \
    --force-new-deployment \
    --region ${AWS_REGION}

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Image: ${ECR_REPOSITORY}:${IMAGE_TAG}${NC}"
