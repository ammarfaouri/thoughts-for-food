import React, { Component } from "react";
import MiniRecipe from "./MiniRecipe";
import CardDeck from "react-bootstrap/CardDeck";

import { getUserProfile } from "./api/client";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      recipes: [],
    };
  }
  componentDidMount() {
    let self = this;
    getUserProfile(self.props.user)
      .then((profile) => {
        self.setState({
          firstName: profile.firstName,
          lastName: profile.lastName,
          recipes: profile.recipes,
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  }
  render() {
    let { firstName, lastName } = this.state;
    let recipeList = this.state.recipes.map((recipe) => (
      <MiniRecipe recipe={recipe} key={recipe.id} />
    ));

    return (
      <div className="Profile">
        <div className="user-info">
          <img
            className="avatar-img"
            src="https://previews.123rf.com/images/get4net/get4net1712/get4net171200024/91293920-user-profile.jpg"
            alt={`${firstName} ${lastName}`}
          />
          <span className="eyebrow">Recipe author</span>
          <h3>
            {firstName} {lastName}
          </h3>
        </div>

        <div className="user-recipes">
          <h3>Created Recipes</h3>
          <CardDeck className="recipe-grid">{recipeList}</CardDeck>
        </div>
      </div>
    );
  }
}
export default Profile;
