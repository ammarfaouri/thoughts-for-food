import crypto from "node:crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AuthenticatedUser } from "../../domain/auth/AuthenticatedUser";
import { RefreshTokenRepository } from "../../domain/auth/RefreshTokenRepository";
import { AppError } from "../../shared/AppError";

type AccessTokenPayload = {
  sub: string;
  username: string;
  typ: "access";
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};

export class TokenService {
  constructor(private readonly refreshTokens: RefreshTokenRepository) {}

  async issueTokenPair(user: AuthenticatedUser): Promise<TokenPair> {
    const refreshToken = createOpaqueToken();
    const familyId = crypto.randomUUID();

    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      familyId,
      expiresAt: refreshExpiryDate(),
    });

    return {
      accessToken: this.issueAccessToken(user),
      refreshToken,
      user,
    };
  }

  verifyAccessToken(accessToken: string): AuthenticatedUser {
    try {
      const payload = jwt.verify(
        accessToken,
        env.JWT_ACCESS_SECRET,
      ) as AccessTokenPayload;

      if (payload.typ !== "access" || !payload.sub || !payload.username) {
        throw new AppError(401, "Invalid access token", "INVALID_ACCESS_TOKEN");
      }

      return {
        id: payload.sub,
        username: payload.username,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, "Invalid access token", "INVALID_ACCESS_TOKEN");
    }
  }

  async rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
    const current = await this.refreshTokens.findByTokenHash(
      hashRefreshToken(refreshToken),
    );

    if (!current) {
      throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    if (current.revokedAt) {
      await this.refreshTokens.revokeFamily(current.familyId);
      throw new AppError(401, "Refresh token has been revoked", "REUSED_REFRESH_TOKEN");
    }

    if (current.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokens.revoke(current.id);
      throw new AppError(401, "Refresh token has expired", "EXPIRED_REFRESH_TOKEN");
    }

    const nextRefreshToken = createOpaqueToken();
    const next = await this.refreshTokens.create({
      userId: current.userId,
      tokenHash: hashRefreshToken(nextRefreshToken),
      familyId: current.familyId,
      expiresAt: refreshExpiryDate(),
    });

    await this.refreshTokens.revoke(current.id, next.id);

    return {
      accessToken: this.issueAccessToken(current.user),
      refreshToken: nextRefreshToken,
      user: current.user,
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const current = await this.refreshTokens.findByTokenHash(
      hashRefreshToken(refreshToken),
    );

    if (current) {
      await this.refreshTokens.revoke(current.id);
    }
  }

  cleanupExpiredRefreshTokens(before = new Date()): Promise<number> {
    return this.refreshTokens.deleteExpired(before);
  }

  private issueAccessToken(user: AuthenticatedUser) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      typ: "access",
    };
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }
}

function createOpaqueToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function hashRefreshToken(refreshToken: string) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

function refreshExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_TTL_DAYS);
  return expiresAt;
}
