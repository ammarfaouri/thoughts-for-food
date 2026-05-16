import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import { deleteRecipe, getRecipe } from "./api/client";

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
      showModal: false,
      editAndDelete: false,
      responseStatus: "",
      disableButton: false,
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }
  toggleModal() {
    this.setState((st) => ({
      showModal: !st.showModal,
    }));
  }
  handleDelete() {
    let self = this;
    this.setState({ responseStatus: "", disableButton: true });

    deleteRecipe(self.props.match.params.id)
      .then(function () {
        self.setState({ showModal: false }, () =>
          self.props.history.push("/Recipes")
        );
      })
      .catch(function (error) {
        console.log(error);
        self.setState({
          responseStatus: error.response.status,
          disableButton: false,
        });
      });
  }

  componentDidMount() {
    getRecipe(this.props.match.params.id)
      .then((recipe) => {
        this.setState({
          name: recipe.name,
          author: recipe.author,
          description: recipe.description,
          prepTime: recipe.prepTime,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients,
          method: recipe.method,
          editAndDelete: this.props.user === recipe.author,
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
      showModal,
      editAndDelete,
    } = this.state;
    let ingredientList = ingredients.map((ingredient, index) => {
      return (
        <ListGroup.Item key={`${ingredient.name}-${index}`}>
          {ingredient.amount} {ingredient.unit} {ingredient.name}
        </ListGroup.Item>
      );
    });
    let methodList = method.map((step, index) => {
      return (
        <ListGroup.Item key={`${step}-${index}`}>
          <span className="step-number">{index + 1}</span>
          {step}
        </ListGroup.Item>
      );
    });

    return (
      <div className="SingleRecipe">
        <Card className="recipe-detail-card">
          <Card.Img
            className="RecipeImg"
            variant="top"
            src="https://images.unsplash.com/photo-1572455021453-7d0b208ae250?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1013&q=80"
            alt={name}
          />
          <Card.Body>
            <span className="recipe-chip">Recipe detail</span>
            <Card.Title>{name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              By
              <Link to={`/Users/${author}`}> {author}</Link>
            </Card.Subtitle>

            <Card.Text>{description}</Card.Text>
            <div className="recipe-meta">
              <span>{prepTime} min</span>
              <span>Difficulty {difficulty}/5</span>
            </div>
            <Card.Text className="section-label">Ingredients</Card.Text>

            <ListGroup horizontal>{ingredientList}</ListGroup>

            <Card.Text className="section-label">Method</Card.Text>
            <ListGroup variant="flush">{methodList}</ListGroup>
            {editAndDelete ? (
              <div className="buttons">
                <Link to={`/Recipes/${this.props.match.params.id}/edit`}>
                  <Button className="btn-soft">Edit Recipe</Button>
                </Link>

                <Button onClick={this.toggleModal} variant="danger">
                  Delete Recipe
                </Button>
              </div>
            ) : null}
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={this.toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>Deleting Recipe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you Sure you want to delete this recipe?
            {this.state.responseStatus === 500 && (
              <Alert variant="danger">
                Server cannot handle your request at the moment
              </Alert>
            )}
            {this.state.responseStatus === 401 && (
              <Alert variant="danger">unauthorized request</Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={this.state.disableButton}
              onClick={this.handleDelete}
            >
              {this.state.disableButton ? (
                <Spinner
                  as="span"
                  animation="border"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Delete Recipe"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default SingleRecipe;
