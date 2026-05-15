import { Router } from "express";
import { AuthService } from "../../../application/auth/AuthService";
import { UserProfileService } from "../../../application/users/UserProfileService";
import { asyncHandler } from "../asyncHandler";
import { validateBody } from "../middleware/validateBody";
import { registerUserSchema } from "../schemas";
import { serializeUserProfile } from "../serializers";

export function createUserRoutes(
  authService: AuthService,
  userProfileService: UserProfileService,
) {
  const router = Router();

  router.post(
    "/users",
    validateBody(registerUserSchema),
    asyncHandler(async (req, res) => {
      const user = await authService.register(req.body);
      req.session.user = { id: user.id, username: user.username };
      res.sendStatus(201);
    }),
  );

  router.get(
    "/users/:username",
    asyncHandler(async (req, res) => {
      const profile = await userProfileService.getProfile(req.params.username);
      res.status(200).send(serializeUserProfile(profile));
    }),
  );

  return router;
}
