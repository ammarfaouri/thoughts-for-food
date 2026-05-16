import React, { useEffect, useState } from "react";
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

export type AuthViewState = {
  loggedIn: boolean;
  username: string;
};

const loggedOutState: AuthViewState = {
  loggedIn: false,
  username: "",
};

function App() {
  const [authState, setAuthState] = useState<AuthViewState>(loggedOutState);
  const { loggedIn, username } = authState;

  useEffect(() => {
    refreshAuth()
      .then((auth) => {
        setAuthState({
          username: auth.user.username,
          loggedIn: true,
        });
      })
      .catch(function () {
        clearAccessToken();
        setAuthState(loggedOutState);
      });
  }, []);

  return (
    <div className="App">
      <NavBar loggedIn={loggedIn} user={username} login={setAuthState} />
      <Switch>
        <Route exact path="/About" render={() => <About />} />
        <Route exact path="/Contact" render={() => <Contact />} />
        <Route
          exact
          path="/Recipes/New"
          render={(routeParams) => (
            <RecipeForm loggedIn={loggedIn} user={username} {...routeParams} />
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
              login={setAuthState}
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
              login={setAuthState}
              {...routeParams}
            />
          )}
        />
        <Route
          exact
          path="/Users/:username"
          render={(routeParams) => (
            <Profile user={routeParams.match.params.username} {...routeParams} />
          )}
        />
        <Route exact path="/Recipes" render={() => <Recipes />} />

        <Route exact path="/" render={() => <Home />} />
      </Switch>
    </div>
  );
}

export default App;
