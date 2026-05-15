import { describe, expect, it } from "vitest";
import {
  RecipeDetails,
  RecipeDraft,
  RecipeSummary,
} from "../src/domain/recipe/Recipe";
import { RecipeRepository } from "../src/domain/recipe/RecipeRepository";
import { RecipeService } from "../src/application/recipes/RecipeService";

class InMemoryRecipeRepository implements RecipeRepository {
  recipes: RecipeDetails[] = [];

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
    const recipe = {
      id: crypto.randomUUID(),
      author: authorId,
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

const draft: RecipeDraft = {
  name: "Pizza",
  description: "Simple pizza",
  prepTime: 45,
  difficulty: 3,
  ingredients: [{ amount: 500, unit: "g", name: "Flour" }],
  method: ["Mix dough"],
};

describe("RecipeService", () => {
  it("allows the author to update a recipe", async () => {
    const repository = new InMemoryRecipeRepository();
    repository.recipes.push({ id: "recipe-1", author: "ammar", ...draft });
    const service = new RecipeService(repository);

    await service.update("recipe-1", "ammar", {
      ...draft,
      name: "Updated Pizza",
    });

    expect(repository.recipes[0].name).toBe("Updated Pizza");
  });

  it("rejects updates from another user", async () => {
    const repository = new InMemoryRecipeRepository();
    repository.recipes.push({ id: "recipe-1", author: "ammar", ...draft });
    const service = new RecipeService(repository);

    await expect(
      service.update("recipe-1", "other-user", draft),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
