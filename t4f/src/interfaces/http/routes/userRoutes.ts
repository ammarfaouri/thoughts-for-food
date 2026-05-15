import { Router } from "express";
import { UserProfileService } from "../../../application/users/UserProfileService";
import { asyncHandler } from "../asyncHandler";
import { serializeUserProfile } from "../serializers";

export function createUserRoutes(
  userProfileService: UserProfileService,
) {
  const router = Router();

  router.get(
    "/users/:username",
    asyncHandler(async (req, res) => {
      const profile = await userProfileService.getProfile(req.params.username);
      res.status(200).send(serializeUserProfile(profile));
    }),
  );

  return router;
}
