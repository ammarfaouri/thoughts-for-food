import { PrismaClient } from "@prisma/client";

export const prismaTestClient = new PrismaClient();

export async function resetDatabase() {
  await prismaTestClient.recipeStep.deleteMany();
  await prismaTestClient.recipeIngredient.deleteMany();
  await prismaTestClient.recipe.deleteMany();
  await prismaTestClient.user.deleteMany();
}

export async function disconnectDatabase() {
  await prismaTestClient.$disconnect();
}
