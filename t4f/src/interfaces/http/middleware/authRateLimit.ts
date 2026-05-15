import rateLimit from "express-rate-limit";

export function createAuthRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: "RATE_LIMITED",
      message: "Too many authentication attempts. Please try again later.",
    },
  });
}
