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
};

export type RecipeDraft = {
  name: string;
  description: string;
  prepTime: number;
  difficulty: number;
  ingredients: Ingredient[];
  method: string[];
};
