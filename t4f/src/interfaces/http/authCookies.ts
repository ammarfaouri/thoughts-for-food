import { Response } from "express";
import { env } from "../../config/env";

export const refreshTokenCookieName = "refreshToken";

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(refreshTokenCookieName, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(refreshTokenCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  });
}
