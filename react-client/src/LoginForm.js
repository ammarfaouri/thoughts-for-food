import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import axios from "axios";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loggedIn: false,
      responseStatus: "",
      validated: false,
      responseStatus: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ validated: true, responseStatus: "" });

    let { username, password } = this.state;
    let { history, logIn } = this.props;
    let self = this;

    if (e.currentTarget.checkValidity()) {
      axios({
        method: "post",
        url: "/login",
        data: {
          username: username,
          password: password,
        },
      })
        .then(function (response) {
          if (response.status === 200) {
            self.setState({ loggedIn: true });
            self.props.login({ loggedIn: true, username: self.state.username });
            history.push("/");
          }
        })
        .catch(function (error) {
          self.setState({ responseStatus: error.response.status });
        });
    }
  }

  render() {
    let { username, password, validated } = this.state;

    if (!this.props.loggedIn) {
      return (
        <div className="LoginForm">
          {this.state.responseStatus === 500 && (
            <Alert variant="danger">
              Server cannot handle your request at the moment
            </Alert>
          )}

          <Form
            className="LoginInput"
            noValidate
            validated={validated}
            onSubmit={this.handleSubmit}
          >
            <h2>Log in with your account!</h2>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={this.handleChange}
                isInvalid={this.state.responseStatus === 404}
                required
              />

              <Form.Control.Feedback type="invalid">
                {this.state.responseStatus === 404
                  ? "User does not exist"
                  : "Username required"}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={this.handleChange}
                isInvalid={this.state.responseStatus === 401}
                required
              />

              <Form.Control.Feedback type="invalid">
                {this.state.responseStatus === 401
                  ? "Password incorrect"
                  : "Password required"}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit">
              Log in{" "}
            </Button>
          </Form>
        </div>
      );
    } else {
      return <div className="LoginForm">You are already signed in</div>;
    }
  }
}

export default LoginForm;
