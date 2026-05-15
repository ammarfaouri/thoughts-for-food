import { randomUUID } from "node:crypto";
import {
  RecipeDetails,
  RecipeDraft,
  RecipeSummary,
} from "../../src/domain/recipe/Recipe";
import { RecipeRepository } from "../../src/domain/recipe/RecipeRepository";
import { RegisterUserInput, User } from "../../src/domain/user/User";
import { UserRepository } from "../../src/domain/user/UserRepository";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  findByUsername(username: string) {
    return Promise.resolve(
      this.users.find((user) => user.username === username) ?? null,
    );
  }

  findByEmail(email: string) {
    return Promise.resolve(this.users.find((user) => user.email === email) ?? null);
  }

  create(input: RegisterUserInput & { passwordHash: string }) {
    const user: User = {
      id: randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      passwordHash: input.passwordHash,
    };
    this.users.push(user);
    return Promise.resolve(user);
  }

  usernameById(id: string) {
    return this.users.find((user) => user.id === id)?.username;
  }
}

export class InMemoryRecipeRepository implements RecipeRepository {
  private recipes: RecipeDetails[] = [];

  constructor(private readonly users: InMemoryUserRepository) {}

  findAll() {
    return Promise.resolve(this.recipes);
  }

  findById(id: string) {
    return Promise.resolve(this.recipes.find((recipe) => recipe.id === id) ?? null);
  }

  findSummariesByAuthorUsername(username: string): Promise<RecipeSummary[]> {
    return Promise.resolve(
      this.recipes
        .filter((recipe) => recipe.author === username)
        .map(({ id, name, author, description }) => ({
          id,
          name,
          author,
          description,
        })),
    );
  }

  create(authorId: string, draft: RecipeDraft) {
    const author = this.users.usernameById(authorId);
    if (!author) {
      throw new Error(`User ${authorId} does not exist`);
    }

    const recipe: RecipeDetails = {
      id: randomUUID(),
      author,
      ...draft,
    };
    this.recipes.push(recipe);
    return Promise.resolve(recipe);
  }

  update(id: string, draft: RecipeDraft) {
    const index = this.recipes.findIndex((recipe) => recipe.id === id);
    this.recipes[index] = { ...this.recipes[index], ...draft };
    return Promise.resolve(this.recipes[index]);
  }

  async delete(id: string) {
    this.recipes = this.recipes.filter((recipe) => recipe.id !== id);
  }
}
