import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./infrastructure/logger";
import { prisma } from "./infrastructure/prisma/client";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT },
    `Thoughts for Food API listening at http://localhost:${env.PORT}`,
  );
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Thoughts for Food API shut down");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
