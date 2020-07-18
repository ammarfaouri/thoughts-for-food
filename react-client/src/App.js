import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import NavBar from "./NavBar";
import About from "./About";
import Contact from "./Contact";
import Recipes from "./Recipes";
import SingleRecipe from "./SingleRecipe";
import RecipeForm from "./RecipeForm";
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";

import Home from "./Home";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      username: "",
    };
    this.ToggleLogin = this.ToggleLogin.bind(this);
  }
  ToggleLogin(logState) {
    this.setState(logState);
  }

  render() {
    let { loggedIn, username } = this.state;
    return (
      <div className="App">
        <NavBar
          loggedIn={loggedIn}
          username={username}
          login={this.ToggleLogin}
        />
        <Switch>
          <Route exact path="/About" render={() => <About />} />
          <Route exact path="/Contact" render={() => <Contact />} />
          <Route
            exact
            path="/Recipes/New"
            render={(routeParams) => (
              <RecipeForm
                loggedIn={loggedIn}
                author={username}
                {...routeParams}
              />
            )}
          />
          <Route
            exact
            path="/Recipes/:id"
            render={(routeParams) => <SingleRecipe {...routeParams} />}
          />
          <Route
            exact
            path="/Signup"
            render={(routeParams) => (
              <SignUpForm login={this.ToggleLogin} {...routeParams} />
            )}
          />
          <Route
            exact
            path="/Login"
            render={(routeParams) => (
              <LoginForm login={this.ToggleLogin} {...routeParams} />
            )}
          />
          <Route exact path="/Recipes" render={() => <Recipes />} />

          <Route exact path="/" render={() => <Home />} />
        </Switch>
      </div>
    );
  }
}

export default App;
