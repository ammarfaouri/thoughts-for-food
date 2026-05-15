import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { logout } from "./api/client";

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    //destroy session
    let self = this;
    logout()
      //setstate in parent component
      .then((response) => {
        self.props.login({ loggedIn: false, username: "" });
        this.props.history.push("/");
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }
  render() {
    let { loggedIn, user } = this.props;
    return (
      <div className="NavBar">
        <Navbar expand="lg" variant="light">
          <Navbar.Brand>
            <Link to="/" className="brand-mark">
              <span>T4F</span>
              Thoughts for Food
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navigation" />
          <Navbar.Collapse id="main-navigation">
          <Nav className="mr-auto">
            <Nav.Link>
              <Link to="/About">About</Link>
            </Nav.Link>
            <Nav.Link>
              <Link to="/Contact">Contact</Link>
            </Nav.Link>

            <Nav.Link>
              <Link to="/Recipes">Recipes</Link>
            </Nav.Link>
            {loggedIn ? (
              <Nav.Link>
                <Link to="/Recipes/New">Create Recipe</Link>
              </Nav.Link>
            ) : null}
          </Nav>

          {loggedIn ? (
            <Nav className="ml-auto">
              <Nav.Link>
                <Link to={`/Users/${this.props.user}`}> {user}</Link>
              </Nav.Link>
              <Button onClick={this.handleSignOut} className="btn-ghost">
                Sign Out
              </Button>
            </Nav>
          ) : (
            <Nav className="ml-auto">
              <Nav.Link>
                <Link to="/Login"> Log In</Link>
              </Nav.Link>
              <Nav.Link>
                <Link to="/Signup" className="nav-pill"> Sign Up</Link>
              </Nav.Link>
            </Nav>
          )}
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

export default withRouter(NavBar);
