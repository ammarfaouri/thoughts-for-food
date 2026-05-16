export type ApiEnvelope<T> = {
  data: T;
};

export type AuthUser = {
  id: string;
  username: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export type Ingredient = {
  amount: number | string;
  unit: string;
  name: string;
};

export type Recipe = {
  id: string;
  name: string;
  author: string;
  description: string;
  prepTime: number;
  difficulty: number;
  ingredients: Ingredient[];
  method: string[];
  tags: string[];
};

export type RecipeDraft = {
  name: string;
  author?: string;
  description: string;
  prepTime: number | string;
  difficulty: number | string;
  ingredients: Ingredient[];
  method: string[];
  tags?: string[];
};

export type RecipeSummary = Pick<Recipe, "id" | "name" | "author" | "description">;

export type UserProfile = {
  firstName: string;
  lastName: string;
  recipes: RecipeSummary[];
};
