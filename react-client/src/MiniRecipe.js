import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class MiniRecipe extends Component {
  render() {
    let { name, author, description, _id } = this.props.recipe;
    return (
      <Card className="mt-5">
        <Card.Body>
          <Card.Title>
            <Link to={`/Recipes/${_id}`}>{name}</Link>
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            By
            <Link to={`/Users/${author}`}>{author}</Link>
          </Card.Subtitle>
          <Card.Text>{description.substring(0, 100)}...</Card.Text>
        </Card.Body>
      </Card>
    );
  }
}
export default MiniRecipe;
