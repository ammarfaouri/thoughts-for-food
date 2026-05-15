import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const ammar = await prisma.user.upsert({
    where: { username: "ammar" },
    update: {},
    create: {
      firstName: "Ammar",
      lastName: "Faouri",
      username: "ammar",
      email: "ammar@example.com",
      passwordHash,
    },
  });

  await prisma.recipe.deleteMany({ where: { authorId: ammar.id } });

  const recipes = [
    {
      name: "Chicken Nuggets",
      description:
        "Crispy homemade chicken nuggets with a simple pantry-friendly coating.",
      prepTime: 30,
      difficulty: 2,
      ingredients: [
        { amount: 1, unit: "kg", name: "Chicken breast" },
        { amount: 2, unit: "cups", name: "Breadcrumbs" },
        { amount: 1, unit: "tsp", name: "Paprika" },
      ],
      method: ["Cut chicken", "Coat pieces", "Bake or fry until golden"],
    },
    {
      name: "Pizza",
      description:
        "A simple pizza base with tomato sauce and cheese, ready for custom toppings.",
      prepTime: 50,
      difficulty: 5,
      ingredients: [
        { amount: 500, unit: "g", name: "Flour" },
        { amount: 300, unit: "ml", name: "Water" },
        { amount: 200, unit: "g", name: "Tomato sauce" },
      ],
      method: ["Make dough", "Add sauce and toppings", "Bake until crisp"],
    },
  ];

  for (const recipe of recipes) {
    await prisma.recipe.create({
      data: {
        name: recipe.name,
        description: recipe.description,
        prepTime: recipe.prepTime,
        difficulty: recipe.difficulty,
        authorId: ammar.id,
        ingredients: {
          create: recipe.ingredients.map((ingredient, index) => ({
            ...ingredient,
            position: index + 1,
          })),
        },
        steps: {
          create: recipe.method.map((instruction, index) => ({
            instruction,
            position: index + 1,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
