import { RecipeDetails, RecipeSummary } from "../../domain/recipe/Recipe";
import { TokenPair } from "../../application/auth/TokenService";

type UserProfileResponse = {
  firstName: string;
  lastName: string;
  recipesInfo: RecipeSummary[];
};

export function serializeRecipe(recipe: RecipeDetails) {
  return {
    _id: recipe.id,
    name: recipe.name,
    author: recipe.author,
    description: recipe.description,
    prepTime: recipe.prepTime,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    method: recipe.method,
  };
}

export function serializeRecipeSummary(recipe: RecipeSummary) {
  return {
    _id: recipe.id,
    name: recipe.name,
    author: recipe.author,
    description: recipe.description,
  };
}

export function serializeUserProfile(profile: UserProfileResponse) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    recipesInfo: profile.recipesInfo.map(serializeRecipeSummary),
  };
}

export function serializeTokenPair(tokenPair: TokenPair) {
  return {
    accessToken: tokenPair.accessToken,
    user: tokenPair.user,
  };
}
