import axios from "axios";
import React, { ChangeEvent, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { type RouteComponentProps } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createRecipe, getRecipe, updateRecipe } from "../../api/client";
import { recipeKeys } from "./recipeQueries";
import { userKeys } from "../users/userQueries";
import {
  emptyIngredient,
  emptyMethodStep,
  initialRecipeFormValues,
  recipeFormSchema,
  type RecipeFormValues,
} from "./recipeFormSchema";

type RecipeRouteParams = {
  id?: string;
};

type RecipeFormPageProps = RouteComponentProps<RecipeRouteParams> & {
  loggedIn: boolean;
  user: string;
  edit?: boolean;
};

function RecipeFormPage({ edit = false, history, loggedIn, match, user }: RecipeFormPageProps) {
  const queryClient = useQueryClient();
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const {
    control,
    formState: { errors, isSubmitting, isSubmitted },
    handleSubmit,
    register,
    reset,
  } = useForm<RecipeFormValues>({
    defaultValues: initialRecipeFormValues,
    resolver: zodResolver(recipeFormSchema),
  });

  const {
    append: appendIngredient,
    fields: ingredientFields,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    append: appendMethodStep,
    fields: methodFields,
    remove: removeMethodStep,
  } = useFieldArray({
    control,
    name: "method",
  });

  useEffect(() => {
    if (!edit || !match.params.id) {
      return;
    }

    getRecipe(match.params.id)
      .then((recipe) => {
        if (recipe.author === user) {
          reset({
            name: recipe.name,
            description: recipe.description,
            prepTime: String(recipe.prepTime),
            difficulty: toDifficultyValue(recipe.difficulty),
            ingredients: recipe.ingredients.map((ingredient) => ({
              amount: String(ingredient.amount),
              unit: ingredient.unit,
              name: ingredient.name,
            })),
            method: recipe.method.map((step) => ({ step })),
          });
        } else {
          history.push("/nicetry");
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }, [edit, history, match.params.id, reset, user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files);
  };

  const onSubmit = async (values: RecipeFormValues) => {
    const recipeId = match.params.id;
    const recipeDraft = {
      name: values.name,
      description: values.description,
      prepTime: values.prepTime,
      difficulty: values.difficulty,
      ingredients: values.ingredients,
      method: values.method.map(({ step }) => step),
    };

    setResponseStatus(null);

    try {
      if (edit && recipeId) {
        const recipe = await updateRecipe(recipeId, recipeDraft);
        queryClient.setQueryData(recipeKeys.detail(recipeId), recipe);
        queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.profile(recipe.author) });
        history.push(`/Recipes/${recipeId}`);
      } else {
        const recipe = await createRecipe({ ...recipeDraft, author: user });
        queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.profile(recipe.author) });
        history.push(`/Recipes/${recipe.id}`);
      }
    } catch (error) {
      console.log(error);
      setResponseStatus(getResponseStatus(error));
    }
  };

  const ingredientForms = ingredientFields.map((field, index) => {
    const ingredientError = errors.ingredients?.[index];

    return (
      <Form.Row key={field.id}>
        <Form.Label>Ingredient {index + 1}</Form.Label>
        <Form.Group as={Col} controlId={`ingredients.${index}.amount`}>
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            placeholder="Amount"
            isInvalid={Boolean(ingredientError?.amount)}
            {...register(`ingredients.${index}.amount`)}
          />
          <Form.Control.Feedback type="invalid">
            {ingredientError?.amount?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} controlId={`ingredients.${index}.unit`}>
          <Form.Label>Unit</Form.Label>
          <Form.Control
            type="text"
            placeholder="Unit"
            isInvalid={Boolean(ingredientError?.unit)}
            {...register(`ingredients.${index}.unit`)}
          />
          <Form.Control.Feedback type="invalid">
            {ingredientError?.unit?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} controlId={`ingredients.${index}.name`}>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            isInvalid={Boolean(ingredientError?.name)}
            {...register(`ingredients.${index}.name`)}
          />
          <Form.Control.Feedback type="invalid">
            {ingredientError?.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
        {index ? (
          <Button
            className="delete-button"
            variant="danger"
            onClick={() => removeIngredient(index)}
          >
            Delete ingredient
          </Button>
        ) : null}
      </Form.Row>
    );
  });

  const methodForms = methodFields.map((field, index) => {
    const methodError = errors.method?.[index];

    return (
      <Form.Group key={field.id} controlId={`method.${index}.step`}>
        <Form.Label>Step {index + 1}</Form.Label>
        <Form.Control
          type="text"
          placeholder="Step"
          isInvalid={Boolean(methodError?.step)}
          {...register(`method.${index}.step`)}
        />
        <Form.Control.Feedback type="invalid">
          {methodError?.step?.message}
        </Form.Control.Feedback>
        {index ? (
          <Button variant="danger" onClick={() => removeMethodStep(index)}>
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
        validated={isSubmitted}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Form.Row>
          <Form.Group as={Col} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name"
              isInvalid={Boolean(errors.name)}
              {...register("name")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="prepTime">
            <Form.Label>Preparation time (Number in minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Preparation time"
              isInvalid={Boolean(errors.prepTime)}
              {...register("prepTime")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.prepTime?.message}
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
            isInvalid={Boolean(errors.description)}
            {...register("description")}
          />
          <Form.Control.Feedback type="invalid">
            {errors.description?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="difficulty">
          <Form.Label>Difficulty</Form.Label>
          <Form.Control
            type="number"
            as="select"
            custom
            isInvalid={Boolean(errors.difficulty)}
            {...register("difficulty")}
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            {errors.difficulty?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <h3>Ingredients</h3>
        <Button onClick={() => appendIngredient({ ...emptyIngredient })} variant="primary">
          Add ingredient
        </Button>
        {ingredientForms}
        <h3>Method</h3>
        <Button onClick={() => appendMethodStep({ ...emptyMethodStep })} variant="primary">
          Add step
        </Button>
        {methodForms}

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
            />
          ) : edit ? (
            "Update Recipe"
          ) : (
            "Create Recipe"
          )}
        </Button>
      </Form>
    </div>
  );
}

function toDifficultyValue(value: number): RecipeFormValues["difficulty"] {
  if (value >= 1 && value <= 5) {
    return String(value) as RecipeFormValues["difficulty"];
  }

  return "1";
}

function getResponseStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  return null;
}

export default RecipeFormPage;
