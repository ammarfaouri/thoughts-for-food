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
          <img
            className="aboutimg"
            src="https://previews.123rf.com/images/get4net/get4net1712/get4net171200024/91293920-user-profile.jpg"
          />
          <h3>
            {firstName} {lastName}
          </h3>
          <h3></h3>
          <h3>Email : {email}</h3>
        </div>

        <div className="user-recipes">
          <h3>Created Recipes:</h3>
          <CardDeck>{recipeList}</CardDeck>
        </div>
      </div>
    );
  }
}
export default Profile;
