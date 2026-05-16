import { Prisma, PrismaClient } from "@prisma/client";
import {
  CreateRefreshTokenInput,
  RefreshTokenRecord,
} from "../../domain/auth/RefreshToken";
import { RefreshTokenRepository } from "../../domain/auth/RefreshTokenRepository";

const refreshTokenInclude = {
  user: true,
} satisfies Prisma.RefreshTokenInclude;

type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: typeof refreshTokenInclude;
}>;

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const token = await this.prisma.refreshToken.create({
      data: input,
      include: refreshTokenInclude,
    });
    return toRefreshTokenRecord(token);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: refreshTokenInclude,
    });

    return token ? toRefreshTokenRecord(token) : null;
  }

  async revoke(id: string, replacedByTokenId?: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        replacedByTokenId,
      },
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpired(before: Date): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: before },
      },
    });

    return result.count;
  }
}

function toRefreshTokenRecord(token: RefreshTokenWithUser): RefreshTokenRecord {
  return {
    id: token.id,
    userId: token.userId,
    tokenHash: token.tokenHash,
    familyId: token.familyId,
    expiresAt: token.expiresAt,
    revokedAt: token.revokedAt,
    replacedByTokenId: token.replacedByTokenId,
    createdAt: token.createdAt,
    user: {
      id: token.user.id,
      username: token.user.username,
    },
  };
}
