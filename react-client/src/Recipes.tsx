import React, { useEffect, useState } from "react";
import MiniRecipe from "./MiniRecipe";
import CardDeck from "react-bootstrap/CardDeck";
import { getRecipes } from "./api/client";
import type { Recipe } from "./api/types";

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    getRecipes()
      .then(setRecipes)
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }, []);

  const recipeList = recipes.map((recipe) => (
    <MiniRecipe recipe={recipe} key={recipe.id} />
  ));

  return (
    <div className="Recipes">
      <div className="page-heading">
        <span className="eyebrow">Community cookbook</span>
        <h2>Recipes worth bookmarking</h2>
      </div>
      <CardDeck className="recipe-grid">{recipeList}</CardDeck>
    </div>
  );
}

export default Recipes;
