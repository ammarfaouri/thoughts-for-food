import { RecipeRepository } from "../../domain/recipe/RecipeRepository";
import { UserRepository } from "../../domain/user/UserRepository";
import { AppError } from "../../shared/AppError";

export class UserProfileService {
  constructor(
    private readonly users: UserRepository,
    private readonly recipes: RecipeRepository,
  ) {}

  async getProfile(username: string) {
    const user = await this.users.findByUsername(username);
    if (!user) {
      throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }

    const recipesInfo = await this.recipes.findSummariesByAuthorUsername(username);

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      recipesInfo,
    };
  }
}
