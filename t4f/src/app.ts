import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { AuthService } from "./application/auth/AuthService";
import { TokenService } from "./application/auth/TokenService";
import { RecipeService } from "./application/recipes/RecipeService";
import { UserProfileService } from "./application/users/UserProfileService";
import { env } from "./config/env";
import { logger } from "./infrastructure/logger";
import { PrismaRefreshTokenRepository } from "./infrastructure/repositories/PrismaRefreshTokenRepository";
import { PrismaRecipeRepository } from "./infrastructure/repositories/PrismaRecipeRepository";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { prisma } from "./infrastructure/prisma/client";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import { httpMetrics } from "./interfaces/http/middleware/httpMetrics";
import { notFound } from "./interfaces/http/middleware/notFound";
import { requestContext } from "./interfaces/http/middleware/requestContext";
import { createApiRoutes } from "./interfaces/http/routes/apiRoutes";
import { createSystemRoutes } from "./interfaces/http/routes/systemRoutes";

type AppServices = {
  authService: AuthService;
  tokenService: TokenService;
  recipeService: RecipeService;
  userProfileService: UserProfileService;
};

type CreateAppOptions = {
  services?: AppServices;
  enableLogger?: boolean;
  enableRateLimit?: boolean;
};

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const services = options.services ?? createDefaultServices();

  app.use(requestContext);
  app.use(helmet());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(httpMetrics);

  if (options.enableLogger ?? env.NODE_ENV !== "test") {
    app.use(
      pinoHttp({
        logger,
        genReqId: (req) => req.requestId,
        customProps: (req) => ({
          requestId: req.requestId,
        }),
      }),
    );
  }

  app.use(createSystemRoutes(prisma));
  app.use(
    createApiRoutes(services, {
      enableRateLimit: options.enableRateLimit ?? env.NODE_ENV !== "test",
    }),
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

function createDefaultServices(): AppServices {
  const userRepository = new PrismaUserRepository(prisma);
  const recipeRepository = new PrismaRecipeRepository(prisma);
  const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma);

  return {
    authService: new AuthService(userRepository),
    tokenService: new TokenService(refreshTokenRepository),
    recipeService: new RecipeService(recipeRepository),
    userProfileService: new UserProfileService(userRepository, recipeRepository),
  };
}
