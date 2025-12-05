import { createApp } from "./app.js";
import { logger } from "./config/logger.js";
import { Server } from "http";

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";
const CDN_URL = process.env.CDN_URL || "/static";
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || "10000", 10);

const app = createApp();

const server: Server = app
  .listen(PORT, () => {
    logger.info(
      {
        port: PORT,
        environment: IS_PROD ? "production" : "development",
        cdnUrl: CDN_URL,
        url: `http://localhost:${PORT}`,
      },
      "Server started"
    );
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.error(
        `Port ${PORT} is already in use. Try: PORT=3001 pnpm run dev`
      );
      process.exit(1);
    }
    throw err;
  });

// Graceful shutdown handler
let isShuttingDown = false;

function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress...");
    return;
  }

  isShuttingDown = true;
  logger.info(
    { signal },
    "Received shutdown signal, starting graceful shutdown..."
  );

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during server close");
      process.exit(1);
    }

    logger.info("Server closed successfully, all connections drained");
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error(
      { timeout: SHUTDOWN_TIMEOUT },
      "Graceful shutdown timed out, forcing exit"
    );
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
}

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, "Unhandled rejection");
});
