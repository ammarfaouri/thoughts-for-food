import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

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
