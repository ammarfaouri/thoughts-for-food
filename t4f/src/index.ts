import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./infrastructure/prisma/client";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Thoughts for Food API listening at http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
