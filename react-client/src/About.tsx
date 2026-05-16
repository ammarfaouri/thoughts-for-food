import React from "react";

function About() {
  return (
    <div className="About">
      <div className="split-page">
        <img
          className="aboutimg"
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80"
          alt="Fresh ingredients arranged on a table"
        />
        <div>
          <span className="eyebrow">About the product</span>
          <h2>Recipes with a little more personality.</h2>
          <p>
            Thoughts for Food is a place to publish recipes as complete cooking
            notes: ingredients, prep time, difficulty, and step-by-step method.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
