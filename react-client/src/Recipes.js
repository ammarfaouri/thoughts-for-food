import React, { Component } from "react";
import MiniRecipe from "./MiniRecipe";
import CardDeck from "react-bootstrap/CardDeck";
import axios from "axios";

class Recipes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }

  componentDidMount() {
    axios
      .get("/recipes")
      .then((response) => this.setState({ recipes: response.data }))
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }
  render() {
    let miniRecipes = this.state.recipes.map((recipe) => (
      <MiniRecipe recipe={recipe} key={recipe._id} />
    ));
    return (
      <div className="Recipes">
        <CardDeck>{miniRecipes}</CardDeck>
      </div>
    );
  }
}

export default Recipes;
