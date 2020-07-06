import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
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
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleIngredientChange = this.handleIngredientChange.bind(this);
    this.handleAddIngredient = this.handleAddIngredient.bind(this);
    this.handleAddMethod = this.handleAddMethod.bind(this);
    this.handleMethodChange = this.handleMethodChange.bind(this);
    this.handleMethodDelete = this.handleMethodDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    let { history } = this.props;

    let {
      name,
      author,
      description,
      prepTime,
      difficulty,
      ingredients,
      method,
    } = this.state;

    axios({
      method: "post",
      url: "/recipes",
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
        history.push("/Recipes");
      })
      .catch(function (error) {
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

    let ingredientForms = ingredients.map((ingredient, idx) => {
      return (
        <Form.Row>
          <Form.Label>ingredient {idx + 1}</Form.Label>
          <Form.Group as={Col} controlId={`amount${idx}`}>
            <Form.Label>amount</Form.Label>
            <Form.Control
              type="text"
              placeholder="amount"
              value={ingredient.amount}
              onChange={(e) => {
                this.handleIngredientChange(e, idx);
              }}
            />
          </Form.Group>
          <Form.Group as={Col} controlId={`unit${idx}`}>
            <Form.Label>unit</Form.Label>
            <Form.Control
              type="text"
              placeholder="unit"
              value={ingredient.unit}
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
              value={ingredient.ingredient}
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
        <h2>Create your recipe</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={this.handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="prepTime">
              <Form.Label>Preparation time</Form.Label>
              <Form.Control
                type="text"
                placeholder="Preparation time"
                value={prepTime}
                onChange={this.handleChange}
              />
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
            />
          </Form.Group>

          <Form.Group controlId="difficulty">
            <Form.Label>difficulty</Form.Label>
            <Form.Control
              type="text"
              placeholder="difficulty"
              value={difficulty}
              onChange={this.handleChange}
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

          <Form.Group id="formGridCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}
export default RecipeForm;
