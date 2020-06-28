import React, { Component } from "react";

class SingleRecipe extends Component {
  render() {
    return (
      <div className="SingleRecipe">
        {this.props.id}
        Single recipe! {this.props.match.params.id}
      </div>
    );
  }
}
export default SingleRecipe;
