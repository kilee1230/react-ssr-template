import pino from "pino";
import pinoHttp from "pino-http";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  redact: {
    paths: [
      "email",
      "*.email",
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    censor: "[REDACTED]",
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
});

export const httpLogger = pinoHttp({
  logger,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    censor: "[REDACTED]",
  },
  autoLogging: {
    ignore: (req) => {
      // Skip logging for 304 responses (handled in customLogLevel check)
      // and health check endpoints
      return req.url === "/health";
    },
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    if (res.statusCode === 304) return "silent";
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (_req, _res, err) => {
    return `Request error: ${err.message}`;
  },
});
