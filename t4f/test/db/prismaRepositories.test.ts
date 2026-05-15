import { Prisma } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { RecipeDraft } from "../../src/domain/recipe/Recipe";
import { PrismaRecipeRepository } from "../../src/infrastructure/repositories/PrismaRecipeRepository";
import { PrismaUserRepository } from "../../src/infrastructure/repositories/PrismaUserRepository";
import {
  disconnectDatabase,
  prismaTestClient,
  resetDatabase,
} from "./prismaTestClient";

const users = new PrismaUserRepository(prismaTestClient);
const recipes = new PrismaRecipeRepository(prismaTestClient);

const userInput = {
  firstName: "Ammar",
  lastName: "Faouri",
  username: "ammar",
  email: "ammar@example.com",
  passwordHash: "hashed-password",
};

const pizzaDraft: RecipeDraft = {
  name: "Pizza",
  description: "Simple pizza",
  prepTime: 45,
  difficulty: 3,
  ingredients: [
    { amount: 500, unit: "g", name: "Flour" },
    { amount: 300, unit: "ml", name: "Water" },
  ],
  method: ["Mix dough", "Proof dough", "Bake pizza"],
};

describe("Prisma repositories", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("creates and finds users by username and email", async () => {
    const created = await users.create(userInput);

    await expect(users.findByUsername("ammar")).resolves.toMatchObject({
      id: created.id,
      username: "ammar",
      email: "ammar@example.com",
    });

    await expect(users.findByEmail("ammar@example.com")).resolves.toMatchObject({
      id: created.id,
      username: "ammar",
    });
  });

  it("enforces unique usernames at the database level", async () => {
    await users.create(userInput);

    await expect(
      users.create({
        ...userInput,
        email: "other@example.com",
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });

  it("creates recipes with ordered ingredients and steps", async () => {
    const author = await users.create(userInput);

    const created = await recipes.create(author.id, pizzaDraft);

    expect(created).toMatchObject({
      name: "Pizza",
      author: "ammar",
      prepTime: 45,
      difficulty: 3,
      ingredients: pizzaDraft.ingredients,
      method: pizzaDraft.method,
    });

    await expect(recipes.findById(created.id)).resolves.toMatchObject(created);
  });

  it("replaces ingredients and steps on recipe update", async () => {
    const author = await users.create(userInput);
    const created = await recipes.create(author.id, pizzaDraft);

    const updated = await recipes.update(created.id, {
      ...pizzaDraft,
      name: "Updated Pizza",
      ingredients: [{ amount: 200, unit: "g", name: "Cheese" }],
      method: ["Add cheese", "Bake again"],
    });

    expect(updated.name).toBe("Updated Pizza");
    expect(updated.ingredients).toEqual([
      { amount: 200, unit: "g", name: "Cheese" },
    ]);
    expect(updated.method).toEqual(["Add cheese", "Bake again"]);

    const ingredientRows = await prismaTestClient.recipeIngredient.findMany({
      where: { recipeId: created.id },
    });
    const stepRows = await prismaTestClient.recipeStep.findMany({
      where: { recipeId: created.id },
    });

    expect(ingredientRows).toHaveLength(1);
    expect(stepRows).toHaveLength(2);
  });

  it("returns recipe summaries by author username", async () => {
    const author = await users.create(userInput);
    const created = await recipes.create(author.id, pizzaDraft);

    await expect(
      recipes.findSummariesByAuthorUsername("ammar"),
    ).resolves.toEqual([
      {
        id: created.id,
        name: "Pizza",
        author: "ammar",
        description: "Simple pizza",
      },
    ]);
  });

  it("cascades recipe children when deleting a recipe", async () => {
    const author = await users.create(userInput);
    const created = await recipes.create(author.id, pizzaDraft);

    await recipes.delete(created.id);

    await expect(recipes.findById(created.id)).resolves.toBeNull();
    await expect(
      prismaTestClient.recipeIngredient.count({
        where: { recipeId: created.id },
      }),
    ).resolves.toBe(0);
    await expect(
      prismaTestClient.recipeStep.count({
        where: { recipeId: created.id },
      }),
    ).resolves.toBe(0);
  });
});
