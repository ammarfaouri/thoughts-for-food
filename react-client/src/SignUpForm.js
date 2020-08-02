import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

class SignUpForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      loggedIn: false,
      responseStatus: "",
      validated: false,
      disableButton: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ validated: true, responseStatus: "", disableButton: true });

    if (e.currentTarget.checkValidity()) {
      let { firstName, lastName, username, email, password } = this.state;
      let { history } = this.props;
      let self = this;
      axios({
        method: "post",
        url: "/users",
        data: {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          password: password,
        },
      })
        .then(function (response) {
          if (response.status === 201) {
            self.setState({ loggedIn: true, responseStatus: "201" });
            self.props.login({ loggedIn: true, username: self.state.username });
            history.push(`/Users/${username}`);
          }
        })
        .catch(function (error) {
          self.setState({
            responseStatus: error.response.status,
            disableButton: false,
          });
        });
    } else {
      this.setState({ disableButton: false });
    }
  }
  render() {
    let {
      firstName,
      lastName,
      username,
      email,
      password,
      validated,
    } = this.state;
    if (!this.props.loggedIn) {
      return (
        <div className="SignUpForm" style={{ width: "50%", margin: "auto" }}>
          {this.state.responseStatus === 500 && (
            <Alert variant="danger">
              Server cannot handle your request at the moment
            </Alert>
          )}

          <h2>Create your account!</h2>
          <Form noValidate validated={validated} onSubmit={this.handleSubmit}>
            <Form.Group controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={this.handleChange}
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
                value={lastName}
                onChange={this.handleChange}
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
                value={username}
                onChange={this.handleChange}
                required
                isInvalid={this.state.responseStatus === 409}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                {this.state.responseStatus === 409
                  ? "User already exists"
                  : "Username required"}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={this.handleChange}
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
                value={password}
                onChange={this.handleChange}
                required
              />
              <Form.Control.Feedback type="valid">
                Looks good!
              </Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Password required
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={this.state.disableButton}
            >
              {this.state.disableButton ? (
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
    } else {
      return <div className="SignUpForm">You are already signed in</div>;
    }
  }
}

export default SignUpForm;
