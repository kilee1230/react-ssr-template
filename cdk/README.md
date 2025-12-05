# React SSR CDK Deployment

AWS CDK infrastructure for deploying the React SSR application.

## Architecture

- **ECS Fargate**: Runs the Express SSR server (2+ tasks with auto-scaling)
- **Application Load Balancer**: Distributes traffic to ECS tasks
- **S3**: Stores static assets (JS, CSS)
- **CloudFront**: CDN for static assets
- **VPC**: Private networking for ECS

## Prerequisites

```bash
# Install dependencies
cd cdk
npm install

# Configure AWS credentials
aws configure

# Bootstrap CDK (first time only)
cdk bootstrap
```

## Deployment

```bash
# Build the React app first
cd ..
pnpm run build
pnpm run build:server

# Deploy infrastructure
cd cdk
cdk deploy
```

## Useful Commands

```bash
# Show what will be deployed
cdk diff

# Synthesize CloudFormation template
cdk synth

# Destroy all resources
cdk destroy
```

## Outputs

After deployment, you'll get:
- **LoadBalancerUrl**: Your application URL
- **CloudFrontUrl**: CDN URL for static assets
- **AssetsBucketName**: S3 bucket name

## Cost Optimization

To reduce costs:
- Set `desiredCount: 1` for single task
- Use `natGateways: 0` and public subnets only
- Remove auto-scaling if not needed

## Environment Variables

The ECS task automatically receives:
- `NODE_ENV=production`
- `CDN_URL=https://<cloudfront-domain>`
