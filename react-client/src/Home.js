import React, { Component } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import "./Home.css";
class Home extends Component {
  render() {
    return (
      <div className="Home">
        <Jumbotron>
          <h1>Welcome to Thoughts for Food!</h1>
          <p>
            Thoughts for Food is a place to create and share your favorite food
            recipes with your friends, You can start by browsing our{" "}
            <Link to="/Recipes"> recipes </Link> or by{" "}
            <Link to="/Signup"> creating </Link>
            an account.
          </p>
          <p>
            <Link to="/About">
              <Button variant="primary">About</Button>{" "}
            </Link>
          </p>
        </Jumbotron>
      </div>
    );
  }
}

export default Home;
