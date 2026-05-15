import { Request, Router } from "express";
import { AuthService } from "../../../application/auth/AuthService";
import { TokenService } from "../../../application/auth/TokenService";
import { asyncHandler } from "../asyncHandler";
import { loginSchema, registerUserSchema } from "../schemas";
import { validateBody } from "../middleware/validateBody";
import { createAuthRateLimit } from "../middleware/authRateLimit";
import {
  clearRefreshTokenCookie,
  refreshTokenCookieName,
  setRefreshTokenCookie,
} from "../authCookies";
import { serializeTokenPair } from "../serializers";
import { requireAuth } from "../middleware/requireAuth";
import { AppError } from "../../../shared/AppError";
import { createAccessTokenAuthenticator } from "../middleware/authenticateAccessToken";

type AuthRouteOptions = {
  enableRateLimit?: boolean;
};

export function createAuthRoutes(
  authService: AuthService,
  tokenService: TokenService,
  options: AuthRouteOptions = {},
) {
  const router = Router();
  const authRateLimit = options.enableRateLimit
    ? createAuthRateLimit()
    : (_req: unknown, _res: unknown, next: () => void) => next();
  const authenticateAccessToken = createAccessTokenAuthenticator(tokenService);

  router.post(
    ["/auth/register", "/users"],
    validateBody(registerUserSchema),
    asyncHandler(async (req, res) => {
      const user = await authService.register(req.body);
      const tokenPair = await tokenService.issueTokenPair(user);
      setRefreshTokenCookie(res, tokenPair.refreshToken);
      res.status(201).json(serializeTokenPair(tokenPair));
    }),
  );

  router.post(
    ["/auth/login", "/login"],
    authRateLimit,
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
      const user = await authService.login(req.body.username, req.body.password);
      const tokenPair = await tokenService.issueTokenPair(user);
      setRefreshTokenCookie(res, tokenPair.refreshToken);
      res.status(200).json(serializeTokenPair(tokenPair));
    }),
  );

  router.post(
    "/auth/refresh",
    asyncHandler(async (req, res) => {
      const refreshToken = readRefreshToken(req);
      const tokenPair = await tokenService.rotateRefreshToken(refreshToken);
      setRefreshTokenCookie(res, tokenPair.refreshToken);
      res.status(200).json(serializeTokenPair(tokenPair));
    }),
  );

  router.post(
    ["/auth/logout", "/logout"],
    asyncHandler(async (req, res) => {
      const refreshToken = req.cookies?.[refreshTokenCookieName];
      if (refreshToken) {
        await tokenService.revokeRefreshToken(refreshToken);
      }
      clearRefreshTokenCookie(res);
      res.sendStatus(200);
    }),
  );

  router.get("/auth/me", authenticateAccessToken, requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  router.get("/logged", authenticateAccessToken, requireAuth, (req, res) => {
    res.status(200).send(req.user!.username);
  });

  return router;
}

function readRefreshToken(req: Request) {
  const refreshToken = req.cookies?.[refreshTokenCookieName];
  if (!refreshToken) {
    throw new AppError(401, "Refresh token is required", "REFRESH_TOKEN_REQUIRED");
  }
  return refreshToken;
}
