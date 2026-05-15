import React, { Component } from "react";
import MiniRecipe from "./MiniRecipe";
import CardDeck from "react-bootstrap/CardDeck";
import { getRecipes } from "./api/client";

class Recipes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }

  componentDidMount() {
    getRecipes()
      .then((response) => this.setState({ recipes: response.data }))
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }
  render() {
    let recipeList = this.state.recipes.map((recipe) => (
      <MiniRecipe recipe={recipe} key={recipe._id} />
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
}

export default Recipes;
