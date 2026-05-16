import { CreateRefreshTokenInput, RefreshTokenRecord } from "./RefreshToken";

export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string, replacedByTokenId?: string): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
}
