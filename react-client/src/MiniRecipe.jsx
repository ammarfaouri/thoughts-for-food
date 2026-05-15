import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class MiniRecipe extends Component {
  render() {
    let { name, author, description, _id } = this.props.recipe;
    return (
      <Card className="MiniRecipe">
        <Card.Img
          className="MiniRecipeImg"
          variant="top"
          src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80"
          alt={name}
        />
        <Card.Body>
          <span className="recipe-chip">Recipe</span>
          <Card.Title>
            <Link to={`/Recipes/${_id}`}>{name}</Link>
          </Card.Title>
          <Card.Subtitle className="recipe-author">
            By
            <Link to={`/Users/${author}`}> {author}</Link>
          </Card.Subtitle>
          <Card.Text>{description.substring(0, 100)}...</Card.Text>
        </Card.Body>
      </Card>
    );
  }
}
export default MiniRecipe;
