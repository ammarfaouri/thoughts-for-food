import React from "react";
import RecipeCard from "../recipes/components/RecipeCard";
import CardDeck from "react-bootstrap/CardDeck";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useUserProfileQuery } from "./userQueries";

type ProfileProps = {
  user: string;
};

function ProfilePage({ user }: ProfileProps) {
  const { data: profile, isError, isLoading } = useUserProfileQuery(user);
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const recipes = profile?.recipes ?? [];

  const recipeList = recipes.map((recipe) => (
    <RecipeCard recipe={recipe} key={recipe.id} />
  ));

  return (
    <div className="Profile">
      <div className="user-info">
        <img
          className="avatar-img"
          src="https://previews.123rf.com/images/get4net/get4net1712/get4net171200024/91293920-user-profile.jpg"
          alt={`${firstName} ${lastName}`}
        />
        <span className="eyebrow">Recipe author</span>
        <h3>
          {firstName} {lastName}
        </h3>
      </div>

      <div className="user-recipes">
        <h3>Created Recipes</h3>
        {isLoading ? <Spinner animation="border" role="status" /> : null}
        {isError ? (
          <Alert variant="danger">
            Profile could not be loaded at the moment
          </Alert>
        ) : null}
        <CardDeck className="recipe-grid">{recipeList}</CardDeck>
      </div>
    </div>
  );
}

export default ProfilePage;
