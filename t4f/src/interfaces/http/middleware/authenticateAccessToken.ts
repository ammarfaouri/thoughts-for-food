import { NextFunction, Request, Response } from "express";
import { TokenService } from "../../../application/auth/TokenService";
import { AppError } from "../../../shared/AppError";

export function createAccessTokenAuthenticator(tokenService: TokenService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.header("authorization");
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
    }

    req.user = tokenService.verifyAccessToken(token);
    next();
  };
}
