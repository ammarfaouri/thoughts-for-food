import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";

import axios from "axios";

class RecipeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      author: "",
      description: "",
      prepTime: "",
      difficulty: "",
      ingredients: [{ amount: "", unit: "", name: "" }],
      method: [""],
      responseStatus: "",
      validated: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleIngredientChange = this.handleIngredientChange.bind(this);
    this.handleAddIngredient = this.handleAddIngredient.bind(this);
    this.handleAddMethod = this.handleAddMethod.bind(this);
    this.handleMethodChange = this.handleMethodChange.bind(this);
    this.handleMethodDelete = this.handleMethodDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.edit) {
      let self = this;
      let { user, match, history } = this.props;
      axios
        .get(`/recipes/${match.params.id}`)
        .then((response) => {
          let { data } = response;
          if (data.author === user) {
            self.setState({
              name: data.name,
              author: data.author,
              description: data.description,
              prepTime: data.prepTime,
              difficulty: data.difficulty,
              ingredients: data.ingredients,
              method: data.method,
            });
          } else {
            history.push("/nicetry");
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    }
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  handleIngredientChange(e, idx) {
    let eventKey = e.target.id.substring(0, e.target.id.length - 1);
    let eventValue = e.target.value;

    this.setState((st) => {
      let updatedIngredients = st.ingredients.map((ingredient, index) => {
        if (idx === index) {
          return { ...ingredient, [eventKey]: eventValue };
        } else {
          return ingredient;
        }
      });
      return {
        ...st,
        ingredients: updatedIngredients,
      };
    });
  }

  handleAddIngredient() {
    this.setState((st) => ({
      ...st,
      ingredients: [...st.ingredients, { amount: "", unit: "", name: "" }],
    }));
  }
  handleAddMethod() {
    this.setState((st) => ({
      ...st,
      method: [...st.method, ""],
    }));
  }

  handleMethodChange(e, idx) {
    let eValue = e.target.value;
    this.setState((st) => {
      let updatedMethod = st.method.map((method, index) => {
        if (index === idx) {
          return eValue;
        } else {
          return method;
        }
      });

      return { ...st, method: updatedMethod };
    });
  }

  handleIngredientDelete(e, idx) {
    this.setState((st) => {
      let newIngredients = st.ingredients.filter((ingredient, index) => {
        return index !== idx;
      });
      return {
        ...st,
        ingredients: newIngredients,
      };
    });
  }

  handleMethodDelete(e, idx) {
    this.setState((st) => {
      let newMethods = st.method.filter((method, index) => {
        return index !== idx;
      });
      return {
        ...st,
        method: newMethods,
      };
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    let { history, match, user, edit } = this.props;

    let {
      name,
      description,
      prepTime,
      author,
      difficulty,
      ingredients,
      method,
    } = this.state;
    let self = this;
    this.setState({ validated: true, responseStatus: "" });
    if (e.currentTarget.checkValidity()) {
      if (edit) {
        axios({
          method: "put",
          url: `/recipes/${match.params.id}`,
          data: {
            name: name,
            author: author,
            description: description,
            prepTime: prepTime,
            difficulty: difficulty,
            ingredients: ingredients,
            method: method,
          },
        })
          .then(function (response) {
            history.push(`/Recipes/${match.params.id}`);
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        axios({
          method: "post",
          url: "/recipes",
          data: {
            name: name,
            author: user,
            description: description,
            prepTime: prepTime,
            difficulty: difficulty,
            ingredients: ingredients,
            method: method,
          },
        })
          .then(function (response) {
            history.push(`/Recipes/${response.data}`);
          })
          .catch(function (error) {
            self.setState({ responseStatus: error.response.status });
          });
      }
    }
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

    let ingredientForms = ingredients.map((ingredient, idx) => {
      return (
        <Form.Row>
          <Form.Label>ingredient {idx + 1}</Form.Label>
          <Form.Group as={Col} controlId={`amount${idx}`}>
            <Form.Label>amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="amount"
              value={ingredient.amount}
              required
              isInvalid={NaN}
              onChange={(e) => {
                this.handleIngredientChange(e, idx);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Amount must be a number
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} controlId={`unit${idx}`}>
            <Form.Label>unit</Form.Label>
            <Form.Control
              type="text"
              placeholder="unit"
              value={ingredient.unit}
              required
              onChange={(e) => {
                this.handleIngredientChange(e, idx);
              }}
            />
          </Form.Group>
          <Form.Group as={Col} controlId={`name${idx}`}>
            <Form.Label>ingredientName</Form.Label>
            <Form.Control
              type="text"
              placeholder="ingredientName"
              value={ingredient.name}
              required
              onChange={(e) => {
                this.handleIngredientChange(e, idx);
              }}
            />
          </Form.Group>
          {idx ? (
            <Button
              variant="danger"
              onClick={(e) => this.handleIngredientDelete(e, idx)}
            >
              Delete ingredient
            </Button>
          ) : (
            ""
          )}
        </Form.Row>
      );
    });

    let methodForms = method.map((method, idx) => {
      return (
        <Form.Group controlId={`method${idx}`}>
          <Form.Label>Step {idx + 1}</Form.Label>
          <Form.Control
            type="text"
            placeholder={`step${idx + 1}`}
            value={method}
            required
            onChange={(e) => {
              this.handleMethodChange(e, idx);
            }}
          />
          {idx ? (
            <Button
              variant="danger"
              onClick={(e) => this.handleMethodDelete(e, idx)}
            >
              Delete Step
            </Button>
          ) : (
            ""
          )}
        </Form.Group>
      );
    });

    if (this.props.loggedIn) {
      return (
        <div
          className="RecipeForm"
          style={{
            width: "50%",
            margin: "auto",
            marginTop: "5rem",
            border: "solid 0.1rem",
          }}
        >
          {this.state.responseStatus === 500 && (
            <Alert variant="danger">
              Server cannot handle your request at the moment
            </Alert>
          )}
          <h2>Create your recipe</h2>
          <Form
            noValidate
            validated={this.state.validated}
            onSubmit={this.handleSubmit}
          >
            <Form.Row>
              <Form.Group as={Col} controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={this.handleChange}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="prepTime">
                <Form.Label>Preparation time (Number in minutes)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Preparation time"
                  value={prepTime}
                  onChange={this.handleChange}
                  isInvalid={NaN}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  prepTime should be a number in minutes
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>

            <Form.Group controlId="description">
              <Form.Label>description</Form.Label>
              <Form.Control
                as="textarea"
                rows="7"
                placeholder="Description"
                value={description}
                onChange={this.handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="difficulty">
              <Form.Label>difficulty</Form.Label>
              <Form.Control
                type="number"
                placeholder="difficulty"
                value={difficulty}
                isInvalid={NaN}
                onChange={this.handleChange}
                required
              />
            </Form.Group>
            <h3>ingredients</h3>
            <Button onClick={this.handleAddIngredient} variant="primary">
              Add ingredient
            </Button>
            {ingredientForms}
            <h3>method</h3>
            <Button onClick={this.handleAddMethod} variant="primary">
              Add step
            </Button>
            {methodForms}

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      );
    } else {
      return (
        <div className="RecipeForm">
          <h1>You must be signed in to create a recipe</h1>
        </div>
      );
    }
  }
}
export default RecipeForm;
