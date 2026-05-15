import React from "react";

function Contact() {
  return (
    <div className="Contact">
      <div className="contact-panel">
        <span className="eyebrow">Builder</span>
        <h2>Ammar Faouri</h2>
        <p>
          Backend-focused developer modernizing an early full-stack project into
          a production-style recipe platform.
        </p>
        <div className="tech-list">
          <span>TypeScript</span>
          <span>Express</span>
          <span>PostgreSQL</span>
          <span>Prisma</span>
          <span>React</span>
        </div>
        <div className="contact-links">
          <a href="mailto:eng.ammarfaouri@gmail.com">Email</a>
          <a href="https://github.com/ammarfaouri">Github</a>
          <a href="https://www.linkedin.com/in/ammar-faouri-68a014100/">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
export default Contact;
