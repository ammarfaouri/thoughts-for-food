export type Ingredient = {
  amount: number;
  unit: string;
  name: string;
};

export type RecipeSummary = {
  id: string;
  name: string;
  author: string;
  description: string;
};

export type RecipeDetails = RecipeSummary & {
  prepTime: number;
  difficulty: number;
  ingredients: Ingredient[];
  method: string[];
  tags: string[];
};

export type RecipeDraft = {
  name: string;
  description: string;
  prepTime: number;
  difficulty: number;
  ingredients: Ingredient[];
  method: string[];
  tags?: string[];
};

export type RecipeSearchCriteria = {
  search?: string;
  difficulty?: number;
  maxPrepTime?: number;
  author?: string;
  tag?: string;
  limit: number;
  offset: number;
};
