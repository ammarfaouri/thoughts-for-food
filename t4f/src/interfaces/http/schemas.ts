import { z } from "zod";

const ingredientSchema = z.object({
  amount: z.coerce.number().positive(),
  unit: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

export const recipeDraftSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  prepTime: z.coerce.number().int().positive(),
  difficulty: z.coerce.number().int().min(1).max(5),
  ingredients: z.array(ingredientSchema).min(1),
  method: z.array(z.string().trim().min(1)).min(1),
});

export const registerUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  username: z.string().trim().min(3).max(32),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
