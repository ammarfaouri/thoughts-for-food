import axios from "axios";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { type RouteComponentProps } from "react-router-dom";
import { signUp } from "../../api/client";
import type { AuthViewState } from "../../app/App";
import { signUpSchema, type SignUpFormValues } from "./authSchemas";

type SignUpPageProps = RouteComponentProps & {
  loggedIn: boolean;
  login: (state: AuthViewState) => void;
};

function SignUpPage({ history, loggedIn, login: setLoginState }: SignUpPageProps) {
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const {
    formState: { errors, isSubmitting, isSubmitted },
    handleSubmit,
    register,
  } = useForm<SignUpFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setResponseStatus(null);

    try {
      const auth = await signUp(values);
      setLoginState({
        loggedIn: true,
        username: auth.user.username,
      });
      history.push(`/Users/${values.username}`);
    } catch (error) {
      setResponseStatus(getResponseStatus(error));
    }
  };
  const usernameError =
    responseStatus === 409 ? "User already exists" : errors.username?.message;

  if (loggedIn) {
    return <div className="SignUpForm">You are already signed in</div>;
  }

  return (
    <div className="SignUpForm">
      {responseStatus === 500 && (
        <Alert variant="danger">
          Server cannot handle your request at the moment
        </Alert>
      )}

      <h2>Create your account!</h2>
      <Form
        className="SignupInput"
        noValidate
        validated={isSubmitted}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Form.Group controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="First Name"
            isInvalid={Boolean(errors.firstName)}
            {...register("firstName")}
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
                {errors.firstName?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Last Name"
            isInvalid={Boolean(errors.lastName)}
            {...register("lastName")}
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
                {errors.lastName?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            isInvalid={Boolean(usernameError)}
            {...register("username")}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            {usernameError}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            isInvalid={Boolean(errors.email)}
            {...register("email")}
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
                {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            isInvalid={Boolean(errors.password)}
            {...register("password")}
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
                {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Create Account"
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

export default SignUpPage;
