import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import ListGroup from "react-bootstrap/ListGroup";

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

    axios({
      method: "delete",
      url: `/recipes/${self.props.match.params.id}`,
      data: {
        author: self.state.author,
      },
    })
      .then(function (response) {
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
          editAndDelete: this.props.user === data.author,
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
    let ingredientList = ingredients.map((ingredient) => {
      return (
        <ListGroup.Item>
          {ingredient.amount} {ingredient.unit} {ingredient.name}
        </ListGroup.Item>
      );
    });
    let methodList = method.map((step) => {
      return <ListGroup.Item>{step}</ListGroup.Item>;
    });

    return (
      <div className="SingleRecipe">
        <Card>
          <Card.Img
            className="RecipeImg"
            variant="top"
            src="https://images.unsplash.com/photo-1572455021453-7d0b208ae250?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1013&q=80"
          />
          <Card.Body>
            <Card.Title>{name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              By
              <Link to={`/Users/${author}`}> {author}</Link>
            </Card.Subtitle>

            <Card.Text>{description}</Card.Text>
            <Card.Text>Preparation time: {prepTime}</Card.Text>
            <Card.Text>Difficulty : {difficulty}/5</Card.Text>
            <Card.Text>Ingredients</Card.Text>

            <ListGroup horizontal>{ingredientList}</ListGroup>

            <ListGroup variant="flush">{methodList}</ListGroup>
            {editAndDelete ? (
              <div className="buttons">
                <Link to={`/Recipes/${this.props.match.params.id}/edit`}>
                  <Button variant="warning">Edit Recipe</Button>
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
