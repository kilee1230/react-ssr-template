import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";
const CDN_URL = process.env.CDN_URL || "/static";

const app = createApp();

app
  .listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log(`Environment: ${IS_PROD ? "production" : "development"}`);
    console.log(`CDN URL: ${CDN_URL}`);
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Try: PORT=3001 pnpm run dev`
      );
      process.exit(1);
    }
    throw err;
  });
