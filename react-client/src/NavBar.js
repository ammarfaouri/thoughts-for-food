import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";

class NavBar extends Component {
  render() {
    return (
      <div className="NavBar">
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>
            <Link to="/">T4F</Link>
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link>
              <Link to="/About">About</Link>
            </Nav.Link>
            <Nav.Link>
              <Link to="/Contact">Contact Us</Link>
            </Nav.Link>
            <Nav.Link>
              <Link to="/Recipes">Recipes</Link>
            </Nav.Link>
            <Nav.Link>
              <Link to="/Recipes/New">Create Recipe</Link>
            </Nav.Link>
          </Nav>
          <Nav className="ml-auto">
            <Nav.Link href="#signIn">Log In</Nav.Link>
            <Nav.Link href="#signIn">Sign Up</Nav.Link>
          </Nav>
        </Navbar>
      </div>
    );
  }
}

export default NavBar;
