import { describe, expect, it } from "vitest";
import { AuthService } from "../src/application/auth/AuthService";
import { RegisterUserInput, User } from "../src/domain/user/User";
import { UserRepository } from "../src/domain/user/UserRepository";

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  findByUsername(username: string) {
    return Promise.resolve(this.users.find((user) => user.username === username) ?? null);
  }

  findByEmail(email: string) {
    return Promise.resolve(this.users.find((user) => user.email === email) ?? null);
  }

  create(input: RegisterUserInput & { passwordHash: string }) {
    const user: User = {
      id: crypto.randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      passwordHash: input.passwordHash,
    };
    this.users.push(user);
    return Promise.resolve(user);
  }
}

describe("AuthService", () => {
  it("registers and logs in a user with a hashed password", async () => {
    const users = new InMemoryUserRepository();
    const auth = new AuthService(users);

    const registered = await auth.register({
      firstName: "Ammar",
      lastName: "Faouri",
      username: "ammar",
      email: "ammar@example.com",
      password: "password123",
    });

    expect(registered.passwordHash).not.toBe("password123");

    const loggedIn = await auth.login("ammar", "password123");
    expect(loggedIn.username).toBe("ammar");
  });

  it("rejects duplicate usernames", async () => {
    const users = new InMemoryUserRepository();
    const auth = new AuthService(users);

    const input = {
      firstName: "Ammar",
      lastName: "Faouri",
      username: "ammar",
      email: "ammar@example.com",
      password: "password123",
    };

    await auth.register(input);

    await expect(
      auth.register({ ...input, email: "other@example.com" }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "USERNAME_TAKEN",
      message: "Username already exists",
    });
  });
});
