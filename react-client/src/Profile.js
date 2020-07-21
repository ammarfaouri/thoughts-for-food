import React, { Component } from "react";
import MiniRecipe from "./MiniRecipe";
import CardDeck from "react-bootstrap/CardDeck";

import axios from "axios";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      recipesInfo: [],
    };
  }
  componentDidMount() {
    let self = this;
    axios
      .get(`/users/${self.props.user}`)
      .then((response) => {
        let { data } = response;
        self.setState({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          recipesInfo: data.recipesInfo,
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }
  render() {
    let { firstName, lastName, email } = this.state;
    let { user } = this.props;
    let recipeList = this.state.recipesInfo.map((recipe) => (
      <MiniRecipe recipe={recipe} key={recipe._id} />
    ));

    return (
      <div className="Profile">
        <div className="user-info">
          <h3>{user}</h3>
          <h3>{firstName}</h3>
          <h3>{lastName}</h3>
          <h3>{email}</h3>
        </div>

        <div className="user-recipes">
          <CardDeck>{recipeList}</CardDeck>
        </div>
      </div>
    );
  }
}
export default Profile;
