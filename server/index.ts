import { createApp } from "./app.js";
import { logger } from "./config/logger.js";

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";
const CDN_URL = process.env.CDN_URL || "/static";

const app = createApp();

app
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
