import { AuthenticatedUser } from "./AuthenticatedUser";

export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  createdAt: Date;
  user: AuthenticatedUser;
};

export type CreateRefreshTokenInput = {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
};
