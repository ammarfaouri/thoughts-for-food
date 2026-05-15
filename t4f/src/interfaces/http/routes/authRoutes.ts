import { Router } from "express";
import { AuthService } from "../../../application/auth/AuthService";
import { asyncHandler } from "../asyncHandler";
import { loginSchema } from "../schemas";
import { validateBody } from "../middleware/validateBody";
import { createAuthRateLimit } from "../middleware/authRateLimit";

type AuthRouteOptions = {
  enableRateLimit?: boolean;
};

export function createAuthRoutes(
  authService: AuthService,
  options: AuthRouteOptions = {},
) {
  const router = Router();
  const authRateLimit = options.enableRateLimit
    ? createAuthRateLimit()
    : (_req: unknown, _res: unknown, next: () => void) => next();

  router.post(
    "/login",
    authRateLimit,
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
      const user = await authService.login(req.body.username, req.body.password);
      req.session.user = { id: user.id, username: user.username };
      res.sendStatus(200);
    }),
  );

  router.get("/logged", (req, res) => {
    if (!req.session.user) {
      return res.sendStatus(404);
    }

    return res.status(200).send(req.session.user.username);
  });

  router.get("/logout", (req, res, next) => {
    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }
      res.clearCookie("connect.sid");
      res.sendStatus(200);
    });
  });

  return router;
}
