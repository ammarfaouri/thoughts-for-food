import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import NavBar from "../shared/layout/NavBar";
import AboutPage from "../features/marketing/AboutPage";
import ContactPage from "../features/marketing/ContactPage";
import HomePage from "../features/marketing/HomePage";
import LoginPage from "../features/auth/LoginPage";
import SignUpPage from "../features/auth/SignUpPage";
import RecipesPage from "../features/recipes/RecipesPage";
import RecipeDetailPage from "../features/recipes/RecipeDetailPage";
import RecipeFormPage from "../features/recipes/RecipeFormPage";
import ProfilePage from "../features/users/ProfilePage";

import "../App.css";
import "../Home.css";
import { clearAccessToken, refreshAuth } from "../api/client";

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
        <Route exact path="/About" render={() => <AboutPage />} />
        <Route exact path="/Contact" render={() => <ContactPage />} />
        <Route
          exact
          path="/Recipes/New"
          render={(routeParams) => (
            <RecipeFormPage loggedIn={loggedIn} user={username} {...routeParams} />
          )}
        />
        <Route
          exact
          path="/Recipes/:id"
          render={(routeParams) => (
            <RecipeDetailPage user={username} {...routeParams} />
          )}
        />
        <Route
          exact
          path="/Recipes/:id/edit"
          render={(routeParams) => (
            <RecipeFormPage
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
            <SignUpPage
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
            <LoginPage
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
            <ProfilePage user={routeParams.match.params.username} {...routeParams} />
          )}
        />
        <Route exact path="/Recipes" render={() => <RecipesPage />} />

        <Route exact path="/" render={() => <HomePage />} />
      </Switch>
    </div>
  );
}

export default App;
