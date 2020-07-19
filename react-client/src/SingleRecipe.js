import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import axios from "axios";

class SingleRecipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      author: "",
      description: "",
      prepTime: "",
      difficulty: "",
      ingredients: [],
      method: [],
    };
  }
  componentDidMount() {
    axios
      .get(`/recipes/${this.props.match.params.id}`)
      .then((response) => {
        let { data } = response;
        this.setState({
          name: data.name,
          author: data.author,
          description: data.description,
          prepTime: data.prepTime,
          difficulty: data.difficulty,
          ingredients: data.ingredients,
          method: data.method,
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }
  render() {
    let {
      name,
      author,
      description,
      prepTime,
      difficulty,
      ingredients,
      method,
    } = this.state;
    let ingredientList = ingredients.map((ingredient) => {
      return (
        <li>
          {ingredient.amount},{ingredient.unit},{ingredient.name}
        </li>
      );
    });
    let methodList = method.map((step) => {
      return <li>{step}</li>;
    });

    return (
      <div className="SingleRecipe">
        <h3>{name}</h3>
        <h3>{author}</h3>
        <h3>{description}</h3>
        <h3>{prepTime}</h3>
        <h3>{difficulty}</h3>
        <ul>{ingredientList}</ul>
        <ui>{methodList}</ui>
        <Link to={`/Recipes/${this.props.match.params.id}/edit`}>
          <Button variant="warning">Edit Recipe</Button>
        </Link>

        <Link to="/">
          <Button variant="danger">Delete Recipe</Button>
        </Link>
      </div>
    );
  }
}
export default SingleRecipe;
