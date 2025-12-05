import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { AppController } from '../controllers/app.controller.js';
import { NotFoundController } from '../controllers/notfound.controller.js';

export function createRoutes(
  healthController: HealthController,
  appController: AppController,
  notFoundController: NotFoundController
): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => healthController.getHealth(req, res));

  // API routes would go here
  // router.get('/api/*', ...)

  // Main app route (only for root path)
  router.get('/', (req, res) => appController.renderApp(req, res));

  // 404 for everything else
  router.use((req, res) => notFoundController.handle(req, res));

  return router;
}
