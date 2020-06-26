import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

class MiniRecipe extends Component {
  render() {
    let { name, author, description, prepTime, difficulty } = this.props.recipe;
    return (
      <Card className="mt-5">
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">By {author}</Card.Subtitle>
          <Card.Text>{description.substring(0, 100)}...</Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>
    );
  }
}
export default MiniRecipe;
