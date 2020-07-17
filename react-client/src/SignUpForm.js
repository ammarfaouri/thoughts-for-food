import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
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
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
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
          self.setState({ loggedIn: true });
          self.props.login({ loggedIn: true, username: self.state.username });
          history.push("/");
        }
      })
      .catch(function (error) {
        if (error.response.status === 409) {
          console.log(error, "user already exists");
        }
      });
  }
  render() {
    let { firstName, lastName, username, email, password } = this.state;
    return (
      <div className="SignUpForm" style={{ width: "50%", margin: "auto" }}>
        <h2>Create your account!</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username"
              value={username}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={this.handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Create Account
          </Button>
        </Form>
      </div>
    );
  }
}

export default SignUpForm;
