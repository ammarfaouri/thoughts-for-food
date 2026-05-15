import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://t4f:t4f@localhost:5432/t4f?schema=public"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  SESSION_SECRET: z.string().min(16).default("development-session-secret"),
});

export const env = envSchema.parse(process.env);
