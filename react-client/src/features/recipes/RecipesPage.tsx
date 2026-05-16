import React from "react";
import RecipeCard from "./components/RecipeCard";
import CardDeck from "react-bootstrap/CardDeck";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useRecipesQuery } from "./recipeQueries";

function RecipesPage() {
  const { data: recipes = [], isError, isLoading } = useRecipesQuery();

  const recipeList = recipes.map((recipe) => (
    <RecipeCard recipe={recipe} key={recipe.id} />
  ));

  return (
    <div className="Recipes">
      <div className="page-heading">
        <span className="eyebrow">Community cookbook</span>
        <h2>Recipes worth bookmarking</h2>
      </div>
      {isLoading ? <Spinner animation="border" role="status" /> : null}
      {isError ? (
        <Alert variant="danger">
          Recipes could not be loaded at the moment
        </Alert>
      ) : null}
      <CardDeck className="recipe-grid">{recipeList}</CardDeck>
    </div>
  );
}

export default RecipesPage;
