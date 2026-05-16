import { TokenService } from "../application/auth/TokenService";
import { logger } from "../infrastructure/logger";
import { prisma } from "../infrastructure/prisma/client";
import { PrismaRefreshTokenRepository } from "../infrastructure/repositories/PrismaRefreshTokenRepository";

async function main() {
  const tokenService = new TokenService(new PrismaRefreshTokenRepository(prisma));
  const deletedCount = await tokenService.cleanupExpiredRefreshTokens();

  logger.info({ deletedCount }, "Expired refresh tokens cleaned up");
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, "Failed to clean up expired refresh tokens");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
