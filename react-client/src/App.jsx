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
import Profile from "./Profile";

import Home from "./Home";
import "./App.css";
import "./Home.css";
import { clearAccessToken, refreshAuth } from "./api/client";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      username: "",
      authReady: false,
    };
    this.toggleLogin = this.toggleLogin.bind(this);
  }
  toggleLogin(logState) {
    this.setState(logState);
  }

  componentDidMount() {
    let self = this;
    refreshAuth()
      .then((response) =>
        self.setState({
          username: response.data.user.username,
          loggedIn: true,
          authReady: true,
        })
      )
      .catch(function (error) {
        clearAccessToken();
        self.setState({ loggedIn: false, username: "", authReady: true });
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
