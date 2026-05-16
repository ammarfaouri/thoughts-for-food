import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link, type RouteComponentProps } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import { useDeleteRecipeMutation, useRecipeQuery } from "./recipeQueries";

type RecipeRouteParams = {
  id: string;
};

type RecipeDetailPageProps = RouteComponentProps<RecipeRouteParams> & {
  user: string;
};

function RecipeDetailPage({ history, match, user }: RecipeDetailPageProps) {
  const recipeId = match.params.id;
  const {
    data: recipe,
    isError,
    isLoading,
  } = useRecipeQuery(recipeId);
  const deleteRecipeMutation = useDeleteRecipeMutation();
  const [showModal, setShowModal] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const toggleModal = () => {
    setShowModal((currentShowModal) => !currentShowModal);
  };

  const handleDelete = async () => {
    setResponseStatus(null);

    try {
      await deleteRecipeMutation.mutateAsync(recipeId);
      setShowModal(false);
      history.push("/Recipes");
    } catch (error) {
      console.log(error);
      setResponseStatus(getResponseStatus(error));
    }
  };

  const name = recipe?.name ?? "";
  const author = recipe?.author ?? "";
  const description = recipe?.description ?? "";
  const prepTime = recipe?.prepTime ?? "";
  const difficulty = recipe?.difficulty ?? "";
  const ingredients = recipe?.ingredients ?? [];
  const method = recipe?.method ?? [];
  const editAndDelete = recipe?.author === user;

  const ingredientList = ingredients.map((ingredient, index) => {
    return (
      <ListGroup.Item key={`${ingredient.name}-${index}`}>
        {ingredient.amount} {ingredient.unit} {ingredient.name}
      </ListGroup.Item>
    );
  });

  const methodList = method.map((step, index) => {
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
          {isLoading ? <Spinner animation="border" role="status" /> : null}
          {isError ? (
            <Alert variant="danger">
              Recipe could not be loaded at the moment
            </Alert>
          ) : null}
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
              <Link to={`/Recipes/${recipeId}/edit`}>
                <Button className="btn-soft">Edit Recipe</Button>
              </Link>

              <Button onClick={toggleModal} variant="danger">
                Delete Recipe
              </Button>
            </div>
          ) : null}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Deleting Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you Sure you want to delete this recipe?
          {responseStatus === 500 && (
            <Alert variant="danger">
              Server cannot handle your request at the moment
            </Alert>
          )}
          {responseStatus === 401 && (
            <Alert variant="danger">unauthorized request</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={deleteRecipeMutation.isLoading}
            onClick={handleDelete}
          >
            {deleteRecipeMutation.isLoading ? (
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

function getResponseStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  return null;
}

export default RecipeDetailPage;
