import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { type RouteComponentProps } from "react-router-dom";
import { signUp } from "../../api/client";
import type { AuthViewState } from "../../app/App";
import type { RegisterUserInput } from "../../api/types";

type SignUpPageProps = RouteComponentProps & {
  loggedIn: boolean;
  login: (state: AuthViewState) => void;
};

const initialFormState: RegisterUserInput = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
};

function SignUpPage({ history, loggedIn, login: setLoginState }: SignUpPageProps) {
  const [form, setForm] = useState<RegisterUserInput>(initialFormState);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [id]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidated(true);
    setResponseStatus(null);
    setDisableButton(true);

    if (!event.currentTarget.checkValidity()) {
      setDisableButton(false);
      return;
    }

    try {
      const auth = await signUp(form);
      setLoginState({
        loggedIn: true,
        username: auth.user.username,
      });
      history.push(`/Users/${form.username}`);
    } catch (error) {
      setResponseStatus(getResponseStatus(error));
      setDisableButton(false);
    }
  };

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
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Form.Group controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            First Name required
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            Last Name required
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            isInvalid={responseStatus === 409}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            {responseStatus === 409 ? "User already exists" : "Username required"}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            Email required
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="valid">
            Looks good!
          </Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            Password required
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={disableButton}>
          {disableButton ? (
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
