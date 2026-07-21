import React from "react";
import "../styles/FloatingContactIcons.css";

const FloatingContactIcons = () => {
  return (
    <div className="floating-icons">
      {/* Call */}
      <a href="tel:+91 90715 35535" className="icon call-icon" aria-label="Call">
        <i className="fas fa-phone-alt"></i>
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/9071535535"
        target="_blank"
        rel="noreferrer"
        className="icon whatsapp-icon"
        aria-label="WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
};

export default FloatingContactIcons;
