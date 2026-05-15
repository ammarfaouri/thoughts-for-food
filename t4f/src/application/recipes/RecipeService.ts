import { RecipeDraft } from "../../domain/recipe/Recipe";
import { RecipeRepository } from "../../domain/recipe/RecipeRepository";
import { AppError } from "../../shared/AppError";

export class RecipeService {
  constructor(private readonly recipes: RecipeRepository) {}

  findAll() {
    return this.recipes.findAll();
  }

  async findById(id: string) {
    const recipe = await this.recipes.findById(id);
    if (!recipe) {
      throw new AppError(404, "Recipe not found", "RECIPE_NOT_FOUND");
    }
    return recipe;
  }

  create(authorId: string, draft: RecipeDraft) {
    return this.recipes.create(authorId, draft);
  }

  async update(id: string, username: string, draft: RecipeDraft) {
    const recipe = await this.findById(id);
    if (recipe.author !== username) {
      throw new AppError(401, "Unauthorized recipe update", "UNAUTHORIZED");
    }
    return this.recipes.update(id, draft);
  }

  async delete(id: string, username: string) {
    const recipe = await this.findById(id);
    if (recipe.author !== username) {
      throw new AppError(401, "Unauthorized recipe delete", "UNAUTHORIZED");
    }
    await this.recipes.delete(id);
  }
}
