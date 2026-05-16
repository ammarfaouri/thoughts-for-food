import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { type RouteComponentProps } from "react-router-dom";
import { login } from "../../api/client";
import type { AuthViewState } from "../../app/App";

type LoginPageProps = RouteComponentProps & {
  loggedIn: boolean;
  login: (state: AuthViewState) => void;
};

type LoginPageFormState = {
  username: string;
  password: string;
};

const initialFormState: LoginPageFormState = {
  username: "",
  password: "",
};

function LoginPage({ history, loggedIn, login: setLoginState }: LoginPageProps) {
  const [form, setForm] = useState<LoginPageFormState>(initialFormState);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [id]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidated(true);
    setResponseStatus(null);

    if (!event.currentTarget.checkValidity()) {
      return;
    }

    try {
      const auth = await login(form);
      setLoginState({
        loggedIn: true,
        username: auth.user.username,
      });
      history.push("/");
    } catch (error) {
      setResponseStatus(getResponseStatus(error));
    }
  };

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
        validated={validated}
        onSubmit={handleSubmit}
      >
        <h2>Log in with your account!</h2>
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            isInvalid={responseStatus === 404}
            required
          />

          <Form.Control.Feedback type="invalid">
            {responseStatus === 404 ? "User does not exist" : "Username required"}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            isInvalid={responseStatus === 401}
            required
          />

          <Form.Control.Feedback type="invalid">
            {responseStatus === 401 ? "Password incorrect" : "Password required"}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit">
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
