import React from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="Home">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="eyebrow">Cook, collect, share</span>
          <h1>Thoughts for Food</h1>
          <p>
            A fresh recipe space for saving favorite meals, publishing kitchen
            experiments, and discovering what friends are cooking next.
          </p>
          <div className="hero-actions">
            <Link to="/Recipes">
              <Button className="btn-brand">Browse recipes</Button>
            </Link>
            <Link to="/Signup">
              <Button className="btn-soft">Create account</Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="home-strip">
        <div>
          <strong>Structured recipes</strong>
          <span>Ingredients, prep time, steps</span>
        </div>
        <div>
          <strong>Author profiles</strong>
          <span>Follow the person behind the plate</span>
        </div>
        <div>
          <strong>Personal cookbook</strong>
          <span>Your recipes stay tied to your account</span>
        </div>
      </section>
    </div>
  );
}

export default Home;
