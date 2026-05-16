import { Router } from "express";
import { RecipeService } from "../../../application/recipes/RecipeService";
import { asyncHandler } from "../asyncHandler";
import { createAccessTokenAuthenticator } from "../middleware/authenticateAccessToken";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import { validateQuery } from "../middleware/validateQuery";
import { recipeDraftSchema, recipeSearchQuerySchema } from "../schemas";
import { serializeRecipe } from "../serializers";
import { TokenService } from "../../../application/auth/TokenService";
import { RecipeSearchCriteria } from "../../../domain/recipe/Recipe";

export function createRecipeRoutes(
  recipeService: RecipeService,
  tokenService: TokenService,
) {
  const router = Router();
  const authenticateAccessToken = createAccessTokenAuthenticator(tokenService);

  router
    .route("/recipes")
    .get(
      validateQuery(recipeSearchQuerySchema),
      asyncHandler(async (req, res) => {
        const recipes = await recipeService.findAll(
          req.query as unknown as RecipeSearchCriteria,
        );
        res.json(recipes.map(serializeRecipe));
      }),
    )
    .post(
      authenticateAccessToken,
      requireAuth,
      validateBody(recipeDraftSchema),
      asyncHandler(async (req, res) => {
        const recipe = await recipeService.create(req.user!.id, req.body);
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
      authenticateAccessToken,
      requireAuth,
      validateBody(recipeDraftSchema),
      asyncHandler(async (req, res) => {
        await recipeService.update(req.params.id, req.user!.username, req.body);
        res.sendStatus(200);
      }),
    )
    .delete(
      authenticateAccessToken,
      requireAuth,
      asyncHandler(async (req, res) => {
        await recipeService.delete(req.params.id, req.user!.username);
        res.sendStatus(200);
      }),
    );

  return router;
}
