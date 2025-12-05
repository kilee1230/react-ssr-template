# React SSR Template with Express

A React 19 Server-Side Rendering template with TypeScript, Vite, and Zod. Designed for deployment to AWS ECS (backend) and S3 (static assets).

## Tech Stack

- React 19
- TypeScript
- Vite
- Zod (validation)
- Express
- pnpm

## Project Structure

```
├── src/
│   ├── App.tsx         # React app component
│   └── client.tsx      # Client-side hydration entry
├── server/
│   └── index.ts        # Express SSR server
├── dist/               # Built client bundle (generated)
├── dist-server/        # Built server (generated)
├── Dockerfile          # Container image for ECS
├── vite.config.ts      # Vite configuration
└── deploy-static.sh    # S3 deployment script
```

## Development

```bash
# Install dependencies
pnpm install

# Build client bundle
pnpm run build

# Run development server
pnpm run dev
```

Visit http://localhost:3000

## Deployment

### Option 1: CDK Deployment (Recommended)

```bash
# Build the application
pnpm run build
pnpm run build:server

# Deploy with CDK
cd cdk
npm install
cdk bootstrap  # First time only
cdk deploy
```

This will deploy:
- ECS Fargate service with ALB
- S3 + CloudFront for static assets
- Auto-scaling and health checks

See [cdk/README.md](cdk/README.md) for details.

### Option 2: Manual Deployment

#### 1. Deploy Static Assets to S3

```bash
# Build and upload to S3
chmod +x deploy-static.sh
./deploy-static.sh

# Update YOUR_BUCKET_NAME in deploy-static.sh
```

Make sure your S3 bucket has public read access for static assets.

#### 2. Deploy Backend to ECS

```bash
# Build Docker image
docker build -t react-ssr-app .

# Tag for ECR
docker tag react-ssr-app:latest <account-id>.dkr.ecr.<region>.amazonaws.com/react-ssr-app:latest

# Push to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/react-ssr-app:latest
```

#### 3. Configure Environment Variables

Set `CDN_URL` environment variable in your ECS task definition:

```json
{
  "name": "CDN_URL",
  "value": "https://your-bucket.s3.amazonaws.com/static"
}
```

Or use CloudFront distribution URL for better performance.

## Architecture

- **Express Server (ECS)**: Handles SSR and serves HTML
- **S3 + CloudFront**: Serves static JS bundles
- **Health Check**: `/health` endpoint for ECS health checks

## Production Considerations

- Enable CloudFront in front of S3 for CDN
- Use ALB with ECS for load balancing
- Set appropriate cache headers
- Enable HTTPS/SSL certificates
- Configure proper IAM roles for ECS tasks
