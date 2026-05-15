import { Router } from "express";
import { RecipeService } from "../../../application/recipes/RecipeService";
import { asyncHandler } from "../asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import { recipeDraftSchema } from "../schemas";
import { serializeRecipe } from "../serializers";

export function createRecipeRoutes(recipeService: RecipeService) {
  const router = Router();

  router
    .route("/recipes")
    .get(
      asyncHandler(async (_req, res) => {
        const recipes = await recipeService.findAll();
        res.json(recipes.map(serializeRecipe));
      }),
    )
    .post(
      requireAuth,
      validateBody(recipeDraftSchema),
      asyncHandler(async (req, res) => {
        const recipe = await recipeService.create(req.session.user!.id, req.body);
        res.status(201).send(recipe.id);
      }),
    );

  router
    .route("/recipes/:id")
    .get(
      asyncHandler(async (req, res) => {
        const recipe = await recipeService.findById(req.params.id);
        res.json(serializeRecipe(recipe));
      }),
    )
    .put(
      requireAuth,
      validateBody(recipeDraftSchema),
      asyncHandler(async (req, res) => {
        await recipeService.update(
          req.params.id,
          req.session.user!.username,
          req.body,
        );
        res.sendStatus(200);
      }),
    )
    .delete(
      requireAuth,
      asyncHandler(async (req, res) => {
        await recipeService.delete(req.params.id, req.session.user!.username);
        res.sendStatus(200);
      }),
    );

  return router;
}
