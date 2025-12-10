# React SSR Template with Express

A React 19 Server-Side Rendering template with TypeScript, Vite, and Express. Designed for deployment to AWS ECS (backend) and S3 (static assets).

## Tech Stack

- React 19
- TypeScript
- Vite (with HMR)
- Express
- Tailwind CSS
- Zod (validation)
- Pino (logging)
- Nodemon + tsx (dev server)
- pnpm

## Project Structure

```
├── src/
│   ├── App.tsx              # React app component
│   ├── NotFound.tsx         # 404 page component
│   ├── client.tsx           # Client-side hydration entry
│   ├── index.css            # Global styles (Tailwind)
│   └── types.ts             # Shared type definitions
├── server/
│   ├── index.ts             # Server entry point
│   ├── app.ts               # Express app configuration
│   ├── config/
│   │   └── logger.ts        # Pino logger configuration
│   ├── routes/
│   │   └── index.ts         # Route definitions
│   ├── controllers/
│   │   ├── app.controller.ts      # Main app controller (SSR)
│   │   ├── health.controller.ts   # Health check endpoint
│   │   └── notfound.controller.ts # 404 handler
│   ├── services/
│   │   ├── render.service.ts      # SSR rendering logic
│   │   └── user.service.ts        # User data service
│   └── middleware/
│       ├── bot-protection.ts      # Bot/rate limiting middleware
│       └── error-handler.ts       # Global error handler
├── dist/                    # Built client bundle (generated)
├── dist-server/             # Built server (generated)
├── infra/                   # AWS CDK infrastructure
├── Dockerfile               # Container image for ECS
├── vite.config.ts           # Vite configuration
├── nodemon.json             # Nodemon configuration
└── deploy-static.sh         # S3 deployment script
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run dev
```

This runs **two servers concurrently**:

- **Vite dev server** (port 5173) - React HMR for instant UI updates
- **Express server** (port 3000) - Backend with nodemon auto-restart

Visit http://localhost:3000

### Hot Reload

- **Frontend changes** (`src/`): Vite HMR updates the browser instantly without page refresh
- **Backend changes** (`server/`): Nodemon automatically restarts the Express server

### Available Scripts

| Script                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `pnpm run dev`          | Start dev server with hot reload (recommended) |
| `pnpm run dev:vite`     | Start only Vite dev server                     |
| `pnpm run dev:server`   | Start only Express with nodemon                |
| `pnpm run build`        | Build both client and server                   |
| `pnpm run build:client` | Build client bundle with Vite                  |
| `pnpm run build:server` | Build server with TypeScript                   |
| `pnpm run start`        | Run production server                          |
| `pnpm run lint`         | Run ESLint                                     |
| `pnpm run lint:fix`     | Fix ESLint issues                              |

## Server Architecture

The server follows a layered architecture:

- **Routes** - Define URL endpoints and map to controllers
- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic and data operations
- **Middleware** - Cross-cutting concerns (bot protection, error handling)
- **Config** - Logger and other configuration

### Logging

Uses [Pino](https://github.com/pinojs/pino) for structured JSON logging:

```typescript
import { logger } from "./config/logger.js";

logger.info({ userId: 123 }, "User logged in");
logger.error({ err: error }, "Something went wrong");
logger.debug({ data }, "Debug information");
```

Features:

- Pretty printing in development, JSON in production
- Automatic PII redaction (emails, auth headers, cookies)
- HTTP request logging with `pino-http`
- Configurable log level via `LOG_LEVEL` env var

### Bot Protection Middleware

Built-in security middleware that provides:

- Suspicious URL pattern detection (path traversal, XSS, SQL injection)
- Malicious user agent blocking (scanners, exploit tools)
- Rate limiting (configurable, default: 100 req/min per IP)

```typescript
import { botProtectionMiddleware } from "./middleware/bot-protection";

app.use(
  botProtectionMiddleware({
    windowMs: 60000, // 1 minute window
    maxRequests: 100, // max requests per window
  })
);
```

## Environment Variables

| Variable           | Default                       | Description                              |
| ------------------ | ----------------------------- | ---------------------------------------- |
| `NODE_ENV`         | `development`                 | Environment (`production`/`development`) |
| `PORT`             | `3000`                        | Server port                              |
| `CDN_URL`          | `/static`                     | URL prefix for static assets             |
| `LOG_LEVEL`        | `debug` (dev) / `info` (prod) | Pino log level                           |
| `VITE_DEV_SERVER`  | `http://localhost:5173`       | Vite dev server URL (dev only)           |
| `SHUTDOWN_TIMEOUT` | `10000`                       | Graceful shutdown timeout (ms)           |

## Deployment

### Option 1: CDK Deployment (Recommended)

```bash
# Build the application
pnpm run build

# Deploy with CDK
cd infra
npm install
cdk bootstrap  # First time only
cdk deploy
```

This will deploy:

- ECS Fargate service with ALB
- S3 + CloudFront for static assets
- Auto-scaling and health checks

See [infra/README.md](infra/README.md) for details.

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
- **S3 + CloudFront**: Serves static JS/CSS bundles
- **Health Check**: `/health` endpoint for ECS health checks

## Production Considerations

- Enable CloudFront in front of S3 for CDN
- Use ALB with ECS for load balancing
- Set appropriate cache headers
- Enable HTTPS/SSL certificates
- Configure proper IAM roles for ECS tasks
- Use Redis for rate limiting in multi-instance deployments
