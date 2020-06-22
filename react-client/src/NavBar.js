import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";

class NavBar extends Component {
  render() {
    return (
      <div className="NavBar">
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">ammar</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
          <Nav className="ml-auto">
            <Nav.Link href="#signIn">Sign In</Nav.Link>
            <Nav.Link href="#signIn">Sign Up</Nav.Link>
          </Nav>
        </Navbar>
      </div>
    );
  }
}

export default NavBar;
