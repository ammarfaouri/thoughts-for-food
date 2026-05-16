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
import { createApiV1Routes } from "./interfaces/http/routes/apiV1Routes";
import { createAuthRoutes } from "./interfaces/http/routes/authRoutes";
import { createRecipeRoutes } from "./interfaces/http/routes/recipeRoutes";
import { createSystemRoutes } from "./interfaces/http/routes/systemRoutes";
import { createUserRoutes } from "./interfaces/http/routes/userRoutes";

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
    createApiV1Routes(services, {
      enableRateLimit: options.enableRateLimit ?? env.NODE_ENV !== "test",
    }),
  );
  app.use(createRecipeRoutes(services.recipeService, services.tokenService));
  app.use(createUserRoutes(services.userProfileService));
  app.use(
    createAuthRoutes(services.authService, services.tokenService, {
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
