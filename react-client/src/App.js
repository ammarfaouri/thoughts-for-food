import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import About from "./About";
import Contact from "./Contact";
import Recipes from "./Recipes";
import SingleRecipe from "./SingleRecipe";
import RecipeForm from "./RecipeForm";
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";
import Profile from "./Profile";

import Home from "./Home";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      username: "",
    };
    this.toggleLogin = this.toggleLogin.bind(this);
  }
  toggleLogin(logState) {
    this.setState(logState);
  }

  componentDidMount() {
    let self = this;
    axios
      .get("/logged")
      .then((response) =>
        self.setState({ username: response.data, loggedIn: true })
      )
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }

  render() {
    let { loggedIn, username } = this.state;
    return (
      <div className="App">
        <NavBar loggedIn={loggedIn} user={username} login={this.toggleLogin} />
        <Switch>
          <Route exact path="/About" render={() => <About />} />
          <Route exact path="/Contact" render={() => <Contact />} />
          <Route
            exact
            path="/Recipes/New"
            render={(routeParams) => (
              <RecipeForm
                loggedIn={loggedIn}
                user={username}
                {...routeParams}
              />
            )}
          />
          <Route
            exact
            path="/Recipes/:id"
            render={(routeParams) => (
              <SingleRecipe user={username} {...routeParams} />
            )}
          />
          <Route
            exact
            path="/Recipes/:id/edit"
            render={(routeParams) => (
              <RecipeForm
                loggedIn={loggedIn}
                user={username}
                edit
                {...routeParams}
              />
            )}
          />

          <Route
            exact
            path="/Signup"
            render={(routeParams) => (
              <SignUpForm
                loggedIn={loggedIn}
                login={this.toggleLogin}
                {...routeParams}
              />
            )}
          />
          <Route
            exact
            path="/Login"
            render={(routeParams) => (
              <LoginForm
                loggedIn={loggedIn}
                login={this.toggleLogin}
                {...routeParams}
              />
            )}
          />
          <Route
            exact
            path="/Users/:username"
            render={(routeParams) => (
              <Profile
                user={routeParams.match.params.username}
                {...routeParams}
              />
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
