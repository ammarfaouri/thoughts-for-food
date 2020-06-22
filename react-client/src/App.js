import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import NavBar from "./NavBar";

import Home from "./Home";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact to="/" render={() => <Home />} />
        </Switch>
      </div>
    );
  }
}

export default App;
