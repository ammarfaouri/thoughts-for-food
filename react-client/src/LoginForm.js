import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import axios from "axios";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
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
    let { username, password } = this.state;
    let { history, logIn } = this.props;
    let self = this;
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
        if (error.response.status === 404) {
          console.log(error, "user does not exist");
        } else {
          console.log(error, "password incorrect");
        }
      });
  }

  render() {
    let { username, password } = this.state;
    return (
      <div className="LoginForm" style={{ width: "50%", margin: "auto" }}>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username"
              value={username}
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
            Log in{" "}
          </Button>
        </Form>
      </div>
    );
  }
}

export default LoginForm;
