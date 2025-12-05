import express, { Express } from 'express';
import { botProtectionMiddleware } from './middleware/bot-protection.js';
import { UserService } from './services/user.service.js';
import { RenderService } from './services/render.service.js';
import { HealthController } from './controllers/health.controller.js';
import { AppController } from './controllers/app.controller.js';
import { NotFoundController } from './controllers/notfound.controller.js';
import { createRoutes } from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  // Configuration
  const CDN_URL = process.env.CDN_URL || '/static';
  const IS_PROD = process.env.NODE_ENV === 'production';

  // Initialize Express app
  const app = express();

  // Trust proxy for correct IP detection behind ALB
  app.set('trust proxy', true);

  // Apply bot protection middleware
  app.use(botProtectionMiddleware({
    windowMs: 60000,
    maxRequests: 100,
  }));

  // Serve static files (from dist-server/server/ to project root dist/)
  app.use('/static', express.static(path.join(__dirname, '../../dist')));

  // Initialize services
  const userService = new UserService();
  const renderService = new RenderService(CDN_URL, IS_PROD);

  // Initialize controllers
  const healthController = new HealthController();
  const appController = new AppController(userService, renderService);
  const notFoundController = new NotFoundController();

  // Setup routes
  const routes = createRoutes(healthController, appController, notFoundController);
  app.use(routes);

  return app;
}
