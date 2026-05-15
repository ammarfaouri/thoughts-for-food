import { RegisterUserInput, User } from "./User";

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: RegisterUserInput & { passwordHash: string }): Promise<User>;
}
