import { PrismaClient } from "@prisma/client";
import { RegisterUserInput, User } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(input: RegisterUserInput & { passwordHash: string }): Promise<User> {
    return this.prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.email,
        passwordHash: input.passwordHash,
      },
    });
  }
}
