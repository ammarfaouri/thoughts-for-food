import bcrypt from "bcryptjs";
import { AppError } from "../../shared/AppError";
import { RegisterUserInput } from "../../domain/user/User";
import { UserRepository } from "../../domain/user/UserRepository";

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(input: RegisterUserInput) {
    const existingUsername = await this.users.findByUsername(input.username);
    if (existingUsername) {
      throw new AppError(409, "Username already exists", "USERNAME_TAKEN");
    }

    const existingEmail = await this.users.findByEmail(input.email);
    if (existingEmail) {
      throw new AppError(409, "Email already exists", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.users.create({ ...input, passwordHash });
  }

  async login(username: string, password: string) {
    const user = await this.users.findByUsername(username);
    if (!user) {
      throw new AppError(404, "User does not exist", "USER_NOT_FOUND");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new AppError(401, "Password incorrect", "INVALID_PASSWORD");
    }

    return user;
  }
}
