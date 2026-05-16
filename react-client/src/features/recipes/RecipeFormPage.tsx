import axios from "axios";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { type RouteComponentProps } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createRecipe, getRecipe, updateRecipe } from "../../api/client";
import type { Ingredient } from "../../api/types";
import { recipeKeys } from "./recipeQueries";
import { userKeys } from "../users/userQueries";

type RecipeRouteParams = {
  id?: string;
};

type RecipeFormPageProps = RouteComponentProps<RecipeRouteParams> & {
  loggedIn: boolean;
  user: string;
  edit?: boolean;
};

type RecipeFormState = {
  name: string;
  description: string;
  prepTime: string | number;
  difficulty: string | number;
  ingredients: Ingredient[];
  method: string[];
};

const emptyIngredient: Ingredient = { amount: "", unit: "", name: "" };

const initialFormState: RecipeFormState = {
  name: "",
  description: "",
  prepTime: "",
  difficulty: "1",
  ingredients: [emptyIngredient],
  method: [""],
};

function RecipeFormPage({ edit = false, history, loggedIn, match, user }: RecipeFormPageProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RecipeFormState>(initialFormState);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    if (!edit || !match.params.id) {
      return;
    }

    getRecipe(match.params.id)
      .then((recipe) => {
        if (recipe.author === user) {
          setForm({
            name: recipe.name,
            description: recipe.description,
            prepTime: recipe.prepTime,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients,
            method: recipe.method,
          });
        } else {
          history.push("/nicetry");
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }, [edit, history, match.params.id, user]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [id]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files);
  };

  const handleIngredientChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ingredientIndex: number
  ) => {
    const field = event.target.id.replace(/\d+$/, "") as keyof Ingredient;
    const { value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      ingredients: currentForm.ingredients.map((ingredient, index) => {
        if (ingredientIndex === index) {
          return { ...ingredient, [field]: value };
        }

        return ingredient;
      }),
    }));
  };

  const handleAddIngredient = () => {
    setForm((currentForm) => ({
      ...currentForm,
      ingredients: [...currentForm.ingredients, { ...emptyIngredient }],
    }));
  };

  const handleIngredientDelete = (ingredientIndex: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      ingredients: currentForm.ingredients.filter((ingredient, index) => {
        return index !== ingredientIndex;
      }),
    }));
  };

  const handleAddMethod = () => {
    setForm((currentForm) => ({
      ...currentForm,
      method: [...currentForm.method, ""],
    }));
  };

  const handleMethodChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    methodIndex: number
  ) => {
    const { value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      method: currentForm.method.map((method, index) => {
        if (index === methodIndex) {
          return value;
        }

        return method;
      }),
    }));
  };

  const handleMethodDelete = (methodIndex: number) => {
    setForm((currentForm) => ({
      ...currentForm,
      method: currentForm.method.filter((method, index) => {
        return index !== methodIndex;
      }),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetForm = event.currentTarget;
    const recipeId = match.params.id;

    setValidated(true);
    setResponseStatus(null);
    setDisableButton(true);

    if (!targetForm.checkValidity()) {
      setDisableButton(false);
      return;
    }

    try {
      if (edit && recipeId) {
        const recipe = await updateRecipe(recipeId, form);
        queryClient.setQueryData(recipeKeys.detail(recipeId), recipe);
        queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.profile(recipe.author) });
        history.push(`/Recipes/${recipeId}`);
      } else {
        const recipe = await createRecipe({ ...form, author: user });
        queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.profile(recipe.author) });
        history.push(`/Recipes/${recipe.id}`);
      }
    } catch (error) {
      console.log(error);
      setResponseStatus(getResponseStatus(error));
      setDisableButton(false);
    }
  };

  const ingredientForms = form.ingredients.map((ingredient, index) => {
    return (
      <Form.Row key={`ingredient-${index}`}>
        <Form.Label>Ingredient {index + 1}</Form.Label>
        <Form.Group as={Col} controlId={`amount${index}`}>
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            placeholder="Amount"
            value={ingredient.amount}
            required
            onChange={(event) => {
              handleIngredientChange(event, index);
            }}
          />
          <Form.Control.Feedback type="invalid">
            Amount must be a number
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} controlId={`unit${index}`}>
          <Form.Label>Unit</Form.Label>
          <Form.Control
            type="text"
            placeholder="Unit"
            value={ingredient.unit}
            required
            onChange={(event) => {
              handleIngredientChange(event, index);
            }}
          />
        </Form.Group>
        <Form.Group as={Col} controlId={`name${index}`}>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            value={ingredient.name}
            required
            onChange={(event) => {
              handleIngredientChange(event, index);
            }}
          />
        </Form.Group>
        {index ? (
          <Button
            className="delete-button"
            variant="danger"
            onClick={() => handleIngredientDelete(index)}
          >
            Delete ingredient
          </Button>
        ) : null}
      </Form.Row>
    );
  });

  const methodForms = form.method.map((method, index) => {
    return (
      <Form.Group key={`method-${index}`} controlId={`method${index}`}>
        <Form.Label>Step {index + 1}</Form.Label>
        <Form.Control
          type="text"
          placeholder="Step"
          value={method}
          required
          onChange={(event) => {
            handleMethodChange(event, index);
          }}
        />
        {index ? (
          <Button variant="danger" onClick={() => handleMethodDelete(index)}>
            Delete Step
          </Button>
        ) : null}
      </Form.Group>
    );
  });

  if (!loggedIn) {
    return (
      <div className="RecipeForm">
        <h1>You must be signed in to create a recipe</h1>
      </div>
    );
  }

  return (
    <div className="RecipeForm">
      {responseStatus === 500 && (
        <Alert variant="danger">
          Server cannot handle your request at the moment
        </Alert>
      )}
      {responseStatus === 401 && (
        <Alert variant="danger">unauthorized request</Alert>
      )}

      <span className="eyebrow">Kitchen notes</span>
      <h2>{edit ? "Edit your recipe" : "Create your recipe"}</h2>
      <Form
        className="RecipeInput"
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Form.Row>
          <Form.Group as={Col} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group as={Col} controlId="prepTime">
            <Form.Label>Preparation time (Number in minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Preparation time"
              value={form.prepTime}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              prepTime should be a number in minutes
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>
        <Form.File id="formcheck-api-regular">
          <Form.File.Label>
            <img
              className="aboutimg"
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
              alt="Fresh ingredients"
            />
          </Form.File.Label>
          <Form.File.Input onChange={handleFileChange} />
        </Form.File>
        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={7}
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="difficulty">
          <Form.Label>Difficulty</Form.Label>
          <Form.Control
            type="number"
            as="select"
            custom
            value={form.difficulty}
            onChange={handleChange}
            required
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </Form.Control>
        </Form.Group>
        <h3>Ingredients</h3>
        <Button onClick={handleAddIngredient} variant="primary">
          Add ingredient
        </Button>
        {ingredientForms}
        <h3>Method</h3>
        <Button onClick={handleAddMethod} variant="primary">
          Add step
        </Button>
        {methodForms}

        <Button variant="primary" type="submit" disabled={disableButton}>
          {disableButton ? (
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Create Recipe"
          )}
        </Button>
      </Form>
    </div>
  );
}

function getResponseStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  return null;
}

export default RecipeFormPage;
