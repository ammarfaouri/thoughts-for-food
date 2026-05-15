import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/AppError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.user) {
    throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
  }

  next();
}
