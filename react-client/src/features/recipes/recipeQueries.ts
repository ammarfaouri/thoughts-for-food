import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteRecipe, getRecipe, getRecipes } from "../../api/client";
import { userKeys } from "../users/userQueries";

export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: () => [...recipeKeys.lists()] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
};

export function useRecipesQuery() {
  return useQuery({
    queryKey: recipeKeys.list(),
    queryFn: getRecipes,
  });
}

export function useRecipeQuery(id: string) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => getRecipe(id),
    enabled: Boolean(id),
  });
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: (_response, recipeId) => {
      queryClient.removeQueries({ queryKey: recipeKeys.detail(recipeId) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
