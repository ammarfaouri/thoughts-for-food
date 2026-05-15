import { Prisma, PrismaClient } from "@prisma/client";
import {
  RecipeDetails,
  RecipeDraft,
  RecipeSummary,
} from "../../domain/recipe/Recipe";
import { RecipeRepository } from "../../domain/recipe/RecipeRepository";

const recipeInclude = {
  author: true,
  ingredients: { orderBy: { position: "asc" } },
  steps: { orderBy: { position: "asc" } },
} satisfies Prisma.RecipeInclude;

type RecipeRecord = Prisma.RecipeGetPayload<{ include: typeof recipeInclude }>;

export class PrismaRecipeRepository implements RecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<RecipeDetails[]> {
    const recipes = await this.prisma.recipe.findMany({
      include: recipeInclude,
      orderBy: { createdAt: "desc" },
    });
    return recipes.map(toRecipeDetails);
  }

  async findById(id: string): Promise<RecipeDetails | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude,
    });
    return recipe ? toRecipeDetails(recipe) : null;
  }

  async findSummariesByAuthorUsername(username: string): Promise<RecipeSummary[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { author: { username } },
      include: recipeInclude,
      orderBy: { createdAt: "desc" },
    });
    return recipes.map(toRecipeSummary);
  }

  async create(authorId: string, draft: RecipeDraft): Promise<RecipeDetails> {
    const recipe = await this.prisma.recipe.create({
      data: {
        name: draft.name,
        description: draft.description,
        prepTime: draft.prepTime,
        difficulty: draft.difficulty,
        authorId,
        ingredients: {
          create: draft.ingredients.map((ingredient, index) => ({
            ...ingredient,
            position: index + 1,
          })),
        },
        steps: {
          create: draft.method.map((instruction, index) => ({
            instruction,
            position: index + 1,
          })),
        },
      },
      include: recipeInclude,
    });

    return toRecipeDetails(recipe);
  }

  async update(id: string, draft: RecipeDraft): Promise<RecipeDetails> {
    const recipe = await this.prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await tx.recipeStep.deleteMany({ where: { recipeId: id } });

      return tx.recipe.update({
        where: { id },
        data: {
          name: draft.name,
          description: draft.description,
          prepTime: draft.prepTime,
          difficulty: draft.difficulty,
          ingredients: {
            create: draft.ingredients.map((ingredient, index) => ({
              ...ingredient,
              position: index + 1,
            })),
          },
          steps: {
            create: draft.method.map((instruction, index) => ({
              instruction,
              position: index + 1,
            })),
          },
        },
        include: recipeInclude,
      });
    });

    return toRecipeDetails(recipe);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recipe.delete({ where: { id } });
  }
}

function toRecipeSummary(recipe: RecipeRecord): RecipeSummary {
  return {
    id: recipe.id,
    name: recipe.name,
    author: recipe.author.username,
    description: recipe.description,
  };
}

function toRecipeDetails(recipe: RecipeRecord): RecipeDetails {
  return {
    ...toRecipeSummary(recipe),
    prepTime: recipe.prepTime,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients.map((ingredient) => ({
      amount: ingredient.amount,
      unit: ingredient.unit,
      name: ingredient.name,
    })),
    method: recipe.steps.map((step) => step.instruction),
  };
}
