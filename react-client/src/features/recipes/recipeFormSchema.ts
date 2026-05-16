import { z } from "zod";

const numericText = (requiredMessage: string, numberMessage: string) =>
  z.string().trim().min(1, requiredMessage).regex(/^\d+(\.\d+)?$/, numberMessage);

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, "Name required"),
  description: z.string().trim().min(1, "Description required"),
  prepTime: numericText(
    "Preparation time required",
    "Preparation time should be a number in minutes"
  ),
  difficulty: z.enum(["1", "2", "3", "4", "5"]),
  ingredients: z
    .array(
      z.object({
        amount: numericText("Amount required", "Amount must be a number"),
        unit: z.string().trim().min(1, "Unit required"),
        name: z.string().trim().min(1, "Ingredient name required"),
      })
    )
    .min(1, "At least one ingredient is required"),
  method: z
    .array(
      z.object({
        step: z.string().trim().min(1, "Step required"),
      })
    )
    .min(1, "At least one method step is required"),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export const emptyIngredient = { amount: "", unit: "", name: "" };
export const emptyMethodStep = { step: "" };

export const initialRecipeFormValues: RecipeFormValues = {
  name: "",
  description: "",
  prepTime: "",
  difficulty: "1",
  ingredients: [emptyIngredient],
  method: [emptyMethodStep],
};
