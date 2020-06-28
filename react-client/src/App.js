import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import NavBar from "./NavBar";
import About from "./About";
import Contact from "./Contact";
import Recipes from "./Recipes";
import SingleRecipe from "./SingleRecipe";

import Home from "./Home";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path="/About" render={() => <About />} />
          <Route exact path="/Contact" render={() => <Contact />} />
          <Route
            exact
            path="/Recipes/:id"
            render={(routeParams) => <SingleRecipe {...routeParams} />}
          />
          <Route exact path="/Recipes" render={() => <Recipes />} />

          <Route exact path="/" render={() => <Home />} />
        </Switch>
      </div>
    );
  }
}

export default App;
