import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "thoughts-for-food-api",
    environment: env.NODE_ENV,
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie"],
    remove: true,
  },
});
