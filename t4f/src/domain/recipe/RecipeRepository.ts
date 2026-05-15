import {
  RecipeDetails,
  RecipeDraft,
  RecipeSearchCriteria,
  RecipeSummary,
} from "./Recipe";

export interface RecipeRepository {
  findAll(criteria: RecipeSearchCriteria): Promise<RecipeDetails[]>;
  findById(id: string): Promise<RecipeDetails | null>;
  findSummariesByAuthorUsername(username: string): Promise<RecipeSummary[]>;
  create(authorId: string, draft: RecipeDraft): Promise<RecipeDetails>;
  update(id: string, draft: RecipeDraft): Promise<RecipeDetails>;
  delete(id: string): Promise<void>;
}
