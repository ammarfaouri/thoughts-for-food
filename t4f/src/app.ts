import connectPgSimple from "connect-pg-simple";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import { Pool } from "pg";
import pinoHttp from "pino-http";
import { AuthService } from "./application/auth/AuthService";
import { RecipeService } from "./application/recipes/RecipeService";
import { UserProfileService } from "./application/users/UserProfileService";
import { env } from "./config/env";
import { PrismaRecipeRepository } from "./infrastructure/repositories/PrismaRecipeRepository";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { prisma } from "./infrastructure/prisma/client";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import { notFound } from "./interfaces/http/middleware/notFound";
import { createAuthRoutes } from "./interfaces/http/routes/authRoutes";
import { createRecipeRoutes } from "./interfaces/http/routes/recipeRoutes";
import { createSystemRoutes } from "./interfaces/http/routes/systemRoutes";
import { createUserRoutes } from "./interfaces/http/routes/userRoutes";

type AppServices = {
  authService: AuthService;
  recipeService: RecipeService;
  userProfileService: UserProfileService;
};

type CreateAppOptions = {
  services?: AppServices;
  sessionStore?: session.Store;
  sessionSecret?: string;
  enableLogger?: boolean;
  secureCookies?: boolean;
  enableRateLimit?: boolean;
};

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const services = options.services ?? createDefaultServices();
  const sessionStore = options.sessionStore ?? createPostgresSessionStore();

  app.use(helmet());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(
    session({
      secret: options.sessionSecret ?? env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: options.secureCookies ?? env.NODE_ENV === "production",
      },
      store: sessionStore,
    }),
  );

  if (options.enableLogger ?? env.NODE_ENV !== "test") {
    app.use(pinoHttp());
  }

  app.use(createSystemRoutes(prisma));
  app.use(createRecipeRoutes(services.recipeService));
  app.use(createUserRoutes(services.authService, services.userProfileService));
  app.use(
    createAuthRoutes(services.authService, {
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

  return {
    authService: new AuthService(userRepository),
    recipeService: new RecipeService(recipeRepository),
    userProfileService: new UserProfileService(userRepository, recipeRepository),
  };
}

function createPostgresSessionStore() {
  const PgSessionStore = connectPgSimple(session);
  const sessionPool = new Pool({ connectionString: env.DATABASE_URL });

  return new PgSessionStore({
    pool: sessionPool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  });
}
