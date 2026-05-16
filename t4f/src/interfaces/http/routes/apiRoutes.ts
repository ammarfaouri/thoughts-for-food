import { Request, Router } from "express";
import { AuthService } from "../../../application/auth/AuthService";
import { TokenService } from "../../../application/auth/TokenService";
import { RecipeService } from "../../../application/recipes/RecipeService";
import { UserProfileService } from "../../../application/users/UserProfileService";
import { RecipeSearchCriteria } from "../../../domain/recipe/Recipe";
import { AppError } from "../../../shared/AppError";
import {
  clearRefreshTokenCookie,
  refreshTokenCookieName,
  setRefreshTokenCookie,
} from "../authCookies";
import { asyncHandler } from "../asyncHandler";
import { createAccessTokenAuthenticator } from "../middleware/authenticateAccessToken";
import { createAuthRateLimit } from "../middleware/authRateLimit";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import { validateQuery } from "../middleware/validateQuery";
import {
  loginSchema,
  recipeDraftSchema,
  recipeSearchQuerySchema,
  registerUserSchema,
} from "../schemas";
import {
  serializeRecipe,
  serializeTokenPair,
  serializeUserProfile,
} from "../serializers";

type ApiRouteOptions = {
  enableRateLimit?: boolean;
};

type ApiRouteServices = {
  authService: AuthService;
  tokenService: TokenService;
  recipeService: RecipeService;
  userProfileService: UserProfileService;
};

export function createApiRoutes(
  services: ApiRouteServices,
  options: ApiRouteOptions = {},
) {
  const router = Router();
  const authenticateAccessToken = createAccessTokenAuthenticator(services.tokenService);
  const authRateLimit = options.enableRateLimit
    ? createAuthRateLimit()
    : (_req: unknown, _res: unknown, next: () => void) => next();

  router.post(
    "/api/auth/register",
    validateBody(registerUserSchema),
    asyncHandler(async (req, res) => {
      const user = await services.authService.register(req.body);
      const tokenPair = await services.tokenService.issueTokenPair(user);
      setRefreshTokenCookie(res, tokenPair.refreshToken);
      res.status(201).json({ data: serializeTokenPair(tokenPair) });
    }),
  );

  router.post(
    "/api/auth/login",
    authRateLimit,
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
      const user = await services.authService.login(req.body.username, req.body.password);
      const tokenPair = await services.tokenService.issueTokenPair(user);
      setRefreshTokenCookie(res, tokenPair.refreshToken);
      res.status(200).json({ data: serializeTokenPair(tokenPair) });
    }),
  );

  router.post(
    "/api/auth/refresh",
    asyncHandler(async (req, res) => {
      const tokenPair = await services.tokenService.rotateRefreshToken(
        readRefreshToken(req),
      );
      setRefreshTokenCookie(res, tokenPair.refreshToken);
      res.status(200).json({ data: serializeTokenPair(tokenPair) });
    }),
  );

  router.post(
    "/api/auth/logout",
    asyncHandler(async (req, res) => {
      const refreshToken = req.cookies?.[refreshTokenCookieName];
      if (refreshToken) {
        await services.tokenService.revokeRefreshToken(refreshToken);
      }
      clearRefreshTokenCookie(res);
      res.status(204).send();
    }),
  );

  router.get("/api/auth/me", authenticateAccessToken, requireAuth, (req, res) => {
    res.status(200).json({ data: { user: req.user } });
  });

  router
    .route("/api/recipes")
    .get(
      validateQuery(recipeSearchQuerySchema),
      asyncHandler(async (req, res) => {
        const recipes = await services.recipeService.findAll(
          req.query as unknown as RecipeSearchCriteria,
        );
        res.status(200).json({ data: recipes.map(serializeRecipe) });
      }),
    )
    .post(
      authenticateAccessToken,
      requireAuth,
      validateBody(recipeDraftSchema),
      asyncHandler(async (req, res) => {
        const recipe = await services.recipeService.create(req.user!.id, req.body);
        res.status(201).json({ data: serializeRecipe(recipe) });
      }),
    );

  router
    .route("/api/recipes/:id")
    .get(
      asyncHandler(async (req, res) => {
        const recipe = await services.recipeService.findById(req.params.id);
        res.status(200).json({ data: serializeRecipe(recipe) });
      }),
    )
    .put(
      authenticateAccessToken,
      requireAuth,
      validateBody(recipeDraftSchema),
      asyncHandler(async (req, res) => {
        const recipe = await services.recipeService.update(
          req.params.id,
          req.user!.username,
          req.body,
        );
        res.status(200).json({ data: serializeRecipe(recipe) });
      }),
    )
    .delete(
      authenticateAccessToken,
      requireAuth,
      asyncHandler(async (req, res) => {
        await services.recipeService.delete(req.params.id, req.user!.username);
        res.status(204).send();
      }),
    );

  router.get(
    "/api/users/:username",
    asyncHandler(async (req, res) => {
      const profile = await services.userProfileService.getProfile(req.params.username);
      res.status(200).json({ data: serializeUserProfile(profile) });
    }),
  );

  return router;
}

function readRefreshToken(req: Request) {
  const refreshToken = req.cookies?.[refreshTokenCookieName];
  if (!refreshToken) {
    throw new AppError(401, "Refresh token is required", "REFRESH_TOKEN_REQUIRED");
  }
  return refreshToken;
}
