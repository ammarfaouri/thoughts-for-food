import React from "react";

function Contact() {
  return (
    <div className="Contact">
      <h2>Who am I??</h2>

      <p>
        My name is Ammar Faouri, I'm an aspiring self-taugh web developer, My
        goal is to launch my career building web applications.
      </p>
      <p>
        This Project is built with:
        <h5>Node JS</h5>
        <h5>Express</h5>
        <h5>MongoDB</h5>
        <h5>React</h5>
      </p>
      <p>
        You can contact me at:
        <h5>eng.ammarfaouri@gmail.com</h5>
        <h5>
          <a href="https://github.com/ammarfaouri">Github</a>
        </h5>
        <h5>
          {" "}
          <a href="https://www.linkedin.com/in/ammar-faouri-68a014100/">
            LinkedIn
          </a>
        </h5>
      </p>
    </div>
  );
}
export default Contact;
