import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { Link, useHistory } from "react-router-dom";
import { logout } from "../../api/client";
import type { AuthViewState } from "../../app/App";

type NavBarProps = {
  loggedIn: boolean;
  user: string;
  login: (state: AuthViewState) => void;
};

function NavBar({ loggedIn, user, login }: NavBarProps) {
  const history = useHistory();

  const handleSignOut = () => {
    logout()
      .then(() => {
        login({ loggedIn: false, username: "" });
        history.push("/");
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  };

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
                <Link to={`/Users/${user}`}> {user}</Link>
              </Nav.Link>
              <Button onClick={handleSignOut} className="btn-ghost">
                Sign Out
              </Button>
            </Nav>
          ) : (
            <Nav className="ml-auto">
              <Nav.Link>
                <Link to="/Login"> Log In</Link>
              </Nav.Link>
              <Nav.Link>
                <Link to="/Signup" className="nav-pill">
                  {" "}
                  Sign Up
                </Link>
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default NavBar;
