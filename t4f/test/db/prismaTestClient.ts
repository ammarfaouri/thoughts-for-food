import { PrismaClient } from "@prisma/client";

export const prismaTestClient = new PrismaClient();

export async function resetDatabase() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to reset database when NODE_ENV=production");
  }

  await prismaTestClient.refreshToken.deleteMany();
  await prismaTestClient.recipeTag.deleteMany();
  await prismaTestClient.recipeStep.deleteMany();
  await prismaTestClient.recipeIngredient.deleteMany();
  await prismaTestClient.recipe.deleteMany();
  await prismaTestClient.tag.deleteMany();
  await prismaTestClient.user.deleteMany();
}

export async function disconnectDatabase() {
  await prismaTestClient.$disconnect();
}
