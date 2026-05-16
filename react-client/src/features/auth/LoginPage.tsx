import axios from "axios";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { type RouteComponentProps } from "react-router-dom";
import { login } from "../../api/client";
import type { AuthViewState } from "../../app/App";
import { loginSchema, type LoginFormValues } from "./authSchemas";

type LoginPageProps = RouteComponentProps & {
  loggedIn: boolean;
  login: (state: AuthViewState) => void;
};

function LoginPage({ history, loggedIn, login: setLoginState }: LoginPageProps) {
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const {
    formState: { errors, isSubmitting, isSubmitted },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setResponseStatus(null);

    try {
      const auth = await login(values);
      setLoginState({
        loggedIn: true,
        username: auth.user.username,
      });
      history.push("/");
    } catch (error) {
      setResponseStatus(getResponseStatus(error));
    }
  };
  const usernameError =
    responseStatus === 404 ? "User does not exist" : errors.username?.message;
  const passwordError =
    responseStatus === 401 ? "Password incorrect" : errors.password?.message;

  if (loggedIn) {
    return <div className="LoginForm">You are already signed in</div>;
  }

  return (
    <div className="LoginForm">
      {responseStatus === 500 && (
        <Alert variant="danger">
          Server cannot handle your request at the moment
        </Alert>
      )}

      <Form
        className="LoginInput"
        noValidate
        validated={isSubmitted}
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2>Log in with your account!</h2>
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            isInvalid={Boolean(usernameError)}
            {...register("username")}
          />

          <Form.Control.Feedback type="invalid">
            {usernameError}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            isInvalid={Boolean(passwordError)}
            {...register("password")}
          />

          <Form.Control.Feedback type="invalid">
            {passwordError}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          Log in{" "}
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

export default LoginPage;
