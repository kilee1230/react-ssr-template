import express, { Express } from "express";
import helmet from "helmet";
import compression from "compression";
import { httpLogger } from "./config/logger.js";
import { botProtectionMiddleware } from "./middleware/bot-protection.js";
import { errorHandler } from "./middleware/error-handler.js";
import { UserService } from "./services/user.service.js";
import { RenderService } from "./services/render.service.js";
import { HealthController } from "./controllers/health.controller.js";
import { AppController } from "./controllers/app.controller.js";
import { NotFoundController } from "./controllers/notfound.controller.js";
import { createRoutes } from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  // Configuration
  const CDN_URL = process.env.CDN_URL || "/static";
  const IS_PROD = process.env.NODE_ENV === "production";
  const VITE_DEV_SERVER =
    process.env.VITE_DEV_SERVER || "http://localhost:5173";

  // Initialize Express app
  const app = express();

  // Trust proxy for correct IP detection behind ALB
  app.set("trust proxy", true);

  // Security headers - relaxed in development for Vite HMR
  const TAILWIND_CDN = "https://cdn.tailwindcss.com";
  const cspDirectives = IS_PROD
    ? {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", CDN_URL, TAILWIND_CDN],
        styleSrc: ["'self'", "'unsafe-inline'", CDN_URL],
        imgSrc: ["'self'", "data:", CDN_URL],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", CDN_URL],
      }
    : {
        defaultSrc: ["'self'", VITE_DEV_SERVER],
        scriptSrc: ["'self'", "'unsafe-inline'", VITE_DEV_SERVER, TAILWIND_CDN],
        styleSrc: ["'self'", "'unsafe-inline'", VITE_DEV_SERVER],
        imgSrc: ["'self'", "data:", VITE_DEV_SERVER],
        connectSrc: ["'self'", VITE_DEV_SERVER, "ws://localhost:5173"],
        fontSrc: ["'self'", VITE_DEV_SERVER],
      };

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: cspDirectives,
      },
      crossOriginEmbedderPolicy: false, // Disable if you need to embed external resources
    })
  );

  // Gzip compression for responses
  app.use(
    compression({
      filter: (req, res) => {
        // Don't compress if client doesn't accept encoding
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6, // 1-9, balance between speed and compression
      threshold: 1024, // Only compress responses > 1KB
    })
  );

  // HTTP request logging
  app.use(httpLogger);

  // Apply bot protection middleware
  app.use(
    botProtectionMiddleware({
      windowMs: 60000,
      maxRequests: 100,
    })
  );

  // Serve static files (from dist-server/server/ to project root dist/)
  app.use("/static", express.static(path.join(__dirname, "../../dist")));

  // Initialize services
  const userService = new UserService();
  const renderService = new RenderService(CDN_URL, IS_PROD);

  // Initialize controllers
  const healthController = new HealthController();
  const appController = new AppController(userService, renderService);
  const notFoundController = new NotFoundController(renderService);

  // Setup routes
  const routes = createRoutes(
    healthController,
    appController,
    notFoundController
  );
  app.use(routes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
