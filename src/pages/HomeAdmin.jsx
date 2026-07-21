import React, { useState } from "react";
import HomeSelection from "../sections/HomeSelectionAdmin";
//import FixedMovingForm from "../sections/FixedMovingForm";
//import Modal from "../pages/Model";
import ChatbotIcon from "../components/ChatbotIcon";
import ChatbotWindow from "../components/ChatbotWindow";
import "../styles/Home.css";
//import Testimonials from "../pages/Testimonials"; 
import FloatingContactIcons from "../components/FloatingContactIcons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBuilding,
  faBoxOpen,
  faCheck,
  faShieldAlt,
  faTruck,
  faHandshake,
  faUsers,
  faChevronDown,
  faCar,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/app-styles.css";

const HomeAdmin = ({ onLoginStatusChange }) => {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [shiftingDate, setShiftingDate] = useState("");
  const [activeTab, setActiveTab] = useState("within");
  const [selectedCity, setSelectedCity] = useState("");
  const [error, setError] = useState("");
  const [shiftFromSuggestion, setShiftFromSuggestion] = useState([]);
  const [shiftingToSuggestion, setShiftingToSuggestion] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Coordinates for distance calculation
  const [fromCoords, setFromCoords] = useState(null); // {lat, lon}
  const [toCoords, setToCoords] = useState(null); // {lat, lon}
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [distance, setDistance] = useState(0); // km

  // Fetch suggestions from Geoapify
  const fetchAddressSuggestions = async (query, setSuggestions, city = "") => {
    if (query.length < 3) return;

    const searchQuery = city ? `${query}, ${city}` : query;

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      searchQuery
    )}&limit=5&apiKey=6c4609acb64b46699389f4929be8af24`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };
const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };
  // Haversine formula to calculate distance in km
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) ** 2;

    const c =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCheckPricesAdmin = () => {
    if (!fromAddress || !toAddress) {
      setError("Please fill both From address and To address.");
      return;
    }
    setError("");

    // Calculate distance
    const dist = calculateDistance(fromCoords, toCoords);
    setDistance(dist.toFixed(2)); // store km

    openModal();
  };
 const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
const [open, setOpen] = useState(false);
  return (
    <div className="home">
      <main className="home-content">
        <HomeSelection />
       <FloatingContactIcons />
        </main>
       <ChatbotIcon onClick={handleToggle} isOpen={isOpen} />
        <ChatbotIcon  isOpen={open}  onClick={() => setOpen(!open)}/>

      {open && <ChatbotWindow onClose={() => setOpen(false)} />}
      {isOpen && (
        <ChatbotWindow 
          onClose={handleClose} 
          onMinimize={handleMinimize}
          isMinimized={isMinimized}
        />
      )}
    </div>
  );
};
const ServiceCard = ({ icon, title, desc, features }) => (
  <div className="service-card">
    <div className="service-icon">
      <FontAwesomeIcon icon={icon} />
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
    <ul>
      {features.map((f, i) => (
        <li key={i}>
          <FontAwesomeIcon icon={faCheck} /> {f}
        </li>
      ))}
    </ul>
  </div>
);

const Feature = ({ icon, title, desc }) => (
  <div className="feature-card">
    <FontAwesomeIcon icon={icon} />
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const Stat = ({ number, text }) => (
  <div className="stat-item">
    <div className="stat-number">{number}</div>
    <div className="stat-text">{text}</div>
  </div>
);
export default HomeAdmin;
