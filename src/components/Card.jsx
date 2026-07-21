import React from "react";

const Card = ({ title, description, icon }) => (
    <div className="card">
        <img src={icon} alt={title} />
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

export default Card;
