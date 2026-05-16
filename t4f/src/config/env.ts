import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://t4f:t4f@localhost:5432/t4f?schema=public"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    JWT_ACCESS_SECRET: z.string().min(16).default("development-access-token-secret"),
    JWT_ACCESS_TTL: z.string().default("15m"),
    JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
      .default("info"),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== "production") {
      return;
    }

    if (!process.env.DATABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL must be explicitly set in production",
      });
    }

    if (
      !process.env.JWT_ACCESS_SECRET ||
      value.JWT_ACCESS_SECRET === "development-access-token-secret"
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_ACCESS_SECRET"],
        message: "JWT_ACCESS_SECRET must be explicitly set in production",
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsedEnv.data;
