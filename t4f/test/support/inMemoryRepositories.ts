import { randomUUID } from "node:crypto";
import {
  RecipeDetails,
  RecipeDraft,
  RecipeSearchCriteria,
  RecipeSummary,
} from "../../src/domain/recipe/Recipe";
import { RecipeRepository } from "../../src/domain/recipe/RecipeRepository";
import {
  CreateRefreshTokenInput,
  RefreshTokenRecord,
} from "../../src/domain/auth/RefreshToken";
import { RefreshTokenRepository } from "../../src/domain/auth/RefreshTokenRepository";
import { RegisterUserInput, User } from "../../src/domain/user/User";
import { UserRepository } from "../../src/domain/user/UserRepository";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  findByUsername(username: string) {
    return Promise.resolve(this.users.find((user) => user.username === username) ?? null);
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

  findStoredById(id: string) {
    return this.users.find((user) => user.id === id);
  }
}

export class InMemoryRecipeRepository implements RecipeRepository {
  private recipes: RecipeDetails[] = [];

  constructor(private readonly users: InMemoryUserRepository) {}

  findAll(criteria: RecipeSearchCriteria) {
    const filtered = this.recipes.filter((recipe) => {
      const matchesSearch = criteria.search
        ? `${recipe.name} ${recipe.description}`
            .toLowerCase()
            .includes(criteria.search.toLowerCase())
        : true;
      const matchesDifficulty = criteria.difficulty
        ? recipe.difficulty === criteria.difficulty
        : true;
      const matchesPrepTime = criteria.maxPrepTime
        ? recipe.prepTime <= criteria.maxPrepTime
        : true;
      const matchesAuthor = criteria.author ? recipe.author === criteria.author : true;
      const matchesTag = criteria.tag
        ? recipe.tags.includes(criteria.tag.trim().toLowerCase())
        : true;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesPrepTime &&
        matchesAuthor &&
        matchesTag
      );
    });

    return Promise.resolve(
      filtered.slice(criteria.offset, criteria.offset + criteria.limit),
    );
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
      tags: normalizeTags(draft.tags),
    };
    this.recipes.push(recipe);
    return Promise.resolve(recipe);
  }

  update(id: string, draft: RecipeDraft) {
    const index = this.recipes.findIndex((recipe) => recipe.id === id);
    this.recipes[index] = {
      ...this.recipes[index],
      ...draft,
      tags: normalizeTags(draft.tags),
    };
    return Promise.resolve(this.recipes[index]);
  }

  async delete(id: string) {
    this.recipes = this.recipes.filter((recipe) => recipe.id !== id);
  }
}

function normalizeTags(tags: string[] | undefined) {
  return [
    ...new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  ];
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private refreshTokens: RefreshTokenRecord[] = [];

  constructor(private readonly users: InMemoryUserRepository) {}

  create(input: CreateRefreshTokenInput) {
    const user = this.users.findStoredById(input.userId);
    if (!user) {
      throw new Error(`User ${input.userId} does not exist`);
    }

    const refreshToken: RefreshTokenRecord = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      familyId: input.familyId,
      expiresAt: input.expiresAt,
      revokedAt: null,
      replacedByTokenId: null,
      createdAt: new Date(),
      user: {
        id: user.id,
        username: user.username,
      },
    };
    this.refreshTokens.push(refreshToken);
    return Promise.resolve(refreshToken);
  }

  findByTokenHash(tokenHash: string) {
    return Promise.resolve(
      this.refreshTokens.find((token) => token.tokenHash === tokenHash) ?? null,
    );
  }

  async revoke(id: string, replacedByTokenId?: string) {
    this.refreshTokens = this.refreshTokens.map((token) =>
      token.id === id ? { ...token, revokedAt: new Date(), replacedByTokenId } : token,
    );
  }

  async revokeFamily(familyId: string) {
    this.refreshTokens = this.refreshTokens.map((token) =>
      token.familyId === familyId && !token.revokedAt
        ? { ...token, revokedAt: new Date() }
        : token,
    );
  }
}
