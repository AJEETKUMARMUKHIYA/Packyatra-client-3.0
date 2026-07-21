import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
    <nav>
        <h1>Packyatra Packers</h1>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Admin Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
        </ul>
    </nav>
);

export default Navbar;
