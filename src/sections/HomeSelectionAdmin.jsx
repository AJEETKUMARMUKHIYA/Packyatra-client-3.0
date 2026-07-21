import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FixedMovingForm from "./FixedMovingFormAdmin";
import Modal from "../pages/ModelAdmin";
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
  faTruckMoving,
  faPeopleCarry,
  faSearch,
  faTimes,
  faQuestionCircle,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import "../styles/app-styles.css";

const HomeSelection = ({ onLoginStatusChange }) => {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [shiftingDate, setShiftingDate] = useState("");
  const [activeTab, setActiveTab] = useState("within");
  const [selectedCity, setSelectedCity] = useState("");
  const [error, setError] = useState("");
  const [shiftFromSuggestion, setShiftFromSuggestion] = useState([]);
  const [shiftingToSuggestion, setShiftingToSuggestion] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [distance, setDistance] = useState(0);
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState("All");

  const BANGALORE_COORDS = { lat: 12.9716, lon: 77.5946 };
  const CITY_RADIUS_KM = 30;
  const BETWEEN_RADIUS_KM = 200;

  const fetchAddressSuggestions = async (query, setSuggestions, city = "") => {
    if (query.length < 2) return;

    const searchQuery = city ? `${query}, ${city}` : query;

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      searchQuery
    )}&limit=10&apiKey=6c4609acb64b46699389f4929be8af24`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      let results = data.features || [];

      results = results.filter((f) => {
        if (!f.properties?.lat || !f.properties?.lon) return false;

        const point = {
          lat: f.properties.lat,
          lon: f.properties.lon,
        };

        const dist = calculateDistance(BANGALORE_COORDS, point);

        if (activeTab === "within") {
          return true;
        }

        if (activeTab === "between") {
          if (setSuggestions === setShiftFromSuggestion) {
            return dist <= BETWEEN_RADIUS_KM;
          }
          if (setSuggestions === setShiftingToSuggestion) {
            return dist > CITY_RADIUS_KM;
          }
        }

        return true;
      });

      setSuggestions(results);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCheckPricesAdmin = () => {
    // Check if both addresses are filled
    if (!fromAddress || !toAddress) {
      setError("Please fill both From address and To address.");
      return;
    }

    // Check if addresses were selected from suggestions
    if (!fromCoords) {
      setError("Please select 'From' address from the suggestions.");
      return;
    }

    if (!toCoords) {
      setError("Please select 'To' address from the suggestions.");
      return;
    }

    setError("");

    const dist = calculateDistance(fromCoords, toCoords);
    setDistance(dist.toFixed(2));
    localStorage.setItem("fromAddress", fromAddress);
    localStorage.setItem("toAddress", toAddress);
    localStorage.setItem("shiftingDate", shiftingDate);
    localStorage.setItem("fromCoords", JSON.stringify(fromCoords));
    localStorage.setItem("toCoords", JSON.stringify(toCoords));
    openModal();
  };

  const [activeFaq, setActiveFaq] = useState(null);
  const [activeServiceTab, setActiveServiceTab] = useState("all");

  const toggleFaq = (questionText) => {
    setActiveFaq(activeFaq === questionText ? null : questionText);
  };

  const handleServiceSelect = (serviceTitle) => {
    // Smoothly scroll to the form container
    const element = document.querySelector(".fixed-form") || document.querySelector(".hero-banner") || document.getElementById("home");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Set tab based on service clicked
    if (serviceTitle.toLowerCase().includes("local") || serviceTitle.toLowerCase().includes("household")) {
      setActiveTab("within");
    } else {
      setActiveTab("between");
    }
  };

  const servicesData = [
    {
      icon: faHome,
      title: "Household Relocation",
      desc: "Complete home shifting services including packing, loading, transport, and unpacking.",
      category: "shifting",
      badge: "Most Popular",
      accentColor: "orange",
      features: [
        "Complete packing & unpacking",
        "Furniture dismantling & setup",
        "Fragile item handling",
        "Vehicle transportation assistance",
      ]
    },
    {
      icon: faBuilding,
      title: "Office Relocation",
      desc: "Fast and secure office moving services with minimal business downtime.",
      category: "commercial",
      badge: "Zero Downtime",
      accentColor: "blue",
      features: [
        "IT equipment handling",
        "Document safety & indexing",
        "Weekend relocation",
        "Post-move setup help",
      ]
    },
    {
      icon: faBoxOpen,
      title: "Packing & Storage",
      desc: "High-quality packing materials and secure, climate-controlled storage solutions.",
      category: "storage",
      badge: "Secure Storage",
      accentColor: "teal",
      features: [
        "Premium multi-layer materials",
        "Climate-controlled warehouse",
        "24/7 CCTV & security monitoring",
        "Short & long-term terms",
      ]
    },
    {
      icon: faTruckMoving,
      title: "Local Shifting Services",
      desc: "Quick, hassle-free and affordable relocation within the same city.",
      category: "shifting",
      badge: "Fast Delivery",
      accentColor: "green",
      features: [
        "Same-day shifting guarantee",
        "Budget-friendly flat rates",
        "Dedicated small load trucks",
        "Quick turnaround service",
      ]
    },
    {
      icon: faPeopleCarry,
      title: "Furniture Dismantling & Assembly",
      desc: "Expert handling of large, fragile, and complex modular furniture.",
      category: "storage",
      badge: "Expert Carpentry",
      accentColor: "purple",
      features: [
        "Bed & wardrobe dismantling",
        "Modular kitchen relocation",
        "Office workstation setup",
        "Reinstallation at destination",
      ]
    },
    {
      icon: faCar,
      title: "Vehicle Transportation",
      desc: "Secure bike and car transportation across cities in specialized carriers.",
      category: "commercial",
      badge: "Damage Free",
      accentColor: "red",
      features: [
        "Enclosed vehicle carriers",
        "Door-to-door pickup & drop",
        "Damage-free safety harness",
        "Live transit tracking",
      ]
    }
  ];

  const filteredServices = servicesData.filter(service => {
    if (activeServiceTab === "all") return true;
    return service.category === activeServiceTab;
  });

  const faqCategories = ["All", "Pricing & Booking", "Safety & Insurance", "Our Process", "General"];

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = selectedFaqCategory === "All" || faq.category === selectedFaqCategory;
    const matchesSearch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="content-wrapper">
      <div className="main-content">
        <div id="home" className="page-section active">
          <section style={{
            background: "linear-gradient(135deg, #0b1528 0%, #0f1e36 50%, #070d1a 100%)",
            color: "#ffffff",
            padding: "5.5rem 24px 6.5rem",
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            {/* Ambient Animated Orbs */}
            <motion.div 
              animate={{ 
                x: [0, 50, -30, 0],
                y: [0, -40, 60, 0],
                scale: [1, 1.2, 0.9, 1]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: "absolute",
                top: "10%",
                left: "15%",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0) 70%)",
                pointerEvents: "none"
              }}
            />
            <motion.div 
              animate={{ 
                x: [0, -60, 40, 0],
                y: [0, 50, -30, 0],
                scale: [1, 0.85, 1.15, 1]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: "absolute",
                bottom: "15%",
                right: "10%",
                width: "350px",
                height: "350px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, rgba(6, 182, 212, 0) 70%)",
                pointerEvents: "none"
              }}
            />

            <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
              <div className="hero-grid-container">
                {/* Left Column containing info and truck loop */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                  {/* Hero Information Side */}
                  <div style={{ maxWidth: "680px" }}>
                  {/* Trust Badge */}
                  <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(249, 115, 22, 0.12)",
                      border: "1px solid rgba(249, 115, 22, 0.25)",
                      padding: "8px 16px",
                      borderRadius: "30px",
                      marginBottom: "24px",
                      boxShadow: "0 4px 20px rgba(249, 115, 22, 0.1)"
                    }}
                  >
                    <span style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#f97316",
                      animation: "pulse 1.5s infinite"
                    }} />
                    <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#f97316" }}>
                      🇮🇳 India's #1 Secure Moving Network
                    </span>
                  </motion.div>

                  {/* Main Header */}
                  <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    style={{
                      fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                      fontWeight: "900",
                      lineHeight: "1.15",
                      color: "#ffffff",
                      marginBottom: "16px",
                      letterSpacing: "-0.02em"
                    }}
                  >
                    India Ka Most Trusted <br />
                    <span style={{ 
                      background: "linear-gradient(90deg, #ff8008 0%, #ffc837 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 40px rgba(249, 115, 22, 0.15)"
                    }}>
                      Packers & Movers
                    </span>
                  </motion.h1>

                  {/* Tagline */}
                  <motion.h3
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    style={{
                      fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                      fontWeight: "600",
                      color: "#94a3b8",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    <span style={{ color: "#f97316" }}>●</span> Har Move Mein Bharosa, Har Shift Mein Safety.
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{
                      fontSize: "clamp(15px, 1.5vw, 17px)",
                      color: "#cbd5e1",
                      lineHeight: "1.6",
                      marginBottom: "36px",
                      maxWidth: "580px"
                    }}
                  >
                    Professional relocation services with years of proven experience. 
                    Offering ultra-secure door-to-door moving, full multi-layered packing, 
                    and premium transit insurance coverage across 10+ cities.
                  </motion.p>

                  {/* Key Stats Icons Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "24px",
                      marginTop: "20px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "rgba(249, 115, 22, 0.1)",
                        border: "1px solid rgba(249, 115, 22, 0.2)",
                        color: "#f97316",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>
                        <FontAwesomeIcon icon={faShieldAlt} />
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>100% Secure</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Fully Insured Transit</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "rgba(14, 165, 233, 0.1)",
                        border: "1px solid rgba(14, 165, 233, 0.2)",
                        color: "#0ea5e9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>
                        <FontAwesomeIcon icon={faTruckMoving} />
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>50+ Cities</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Pan-India Coverage</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                        color: "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>15K+ Happy</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Rated 4.9/5 Stars</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Spectacular Delivery Truck Driving & Hills Landscape Loop */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "220px",
                    background: "rgba(15, 23, 42, 0.4)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.3)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end"
                  }}
                >
                  {/* Floating Package Boxes Animation */}
                  <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", pointerEvents: "none" }}>
                    {[1, 2, 3].map((num) => (
                      <motion.div
                        key={num}
                        animate={{
                          y: [0, -40, 0],
                          x: [0, -15, 15, 0],
                          rotate: [0, 360],
                          opacity: [0, 0.7, 0]
                        }}
                        transition={{
                          duration: 4 + num,
                          repeat: Infinity,
                          delay: num * 1.8,
                          ease: "easeInOut"
                        }}
                        style={{
                          position: "absolute",
                          left: `${30 + num * 20}%`,
                          top: "40%",
                          color: "#f97316",
                          fontSize: `${14 + num * 3}px`
                        }}
                      >
                        <FontAwesomeIcon icon={faBoxOpen} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Backdrop Skyline silhouette */}
                  <div style={{
                    position: "absolute",
                    bottom: "35px",
                    left: 0,
                    width: "200%",
                    height: "60px",
                    background: "radial-gradient(ellipse at bottom, rgba(249, 115, 22, 0.05) 0%, transparent 80%)",
                    display: "flex",
                    alignItems: "flex-end",
                    opacity: 0.8
                  }}>
                    {/* Handdrawn CSS Skyline line */}
                    <svg viewBox="0 0 1200 100" style={{ width: "100%", height: "100px", fill: "rgba(30, 41, 59, 0.5)" }}>
                      <path d="M0,100 L0,80 L30,80 L35,50 L55,50 L60,80 L90,80 L100,60 L130,60 L140,80 L180,80 L190,40 L220,40 L230,80 L280,80 L300,30 L340,30 L350,80 L400,80 L420,60 L460,60 L470,80 L520,80 L530,20 L570,20 L580,80 L620,80 L640,70 L680,70 L690,80 L750,80 L760,45 L800,45 L810,80 L860,80 L880,55 L920,55 L930,80 L980,80 L1000,35 L1040,35 L1050,80 L1100,80 L1120,60 L1160,60 L1170,80 L1200,80 Z" />
                    </svg>
                  </div>

                  {/* Roadway Grid & Passing Lines */}
                  <div style={{
                    height: "36px",
                    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                  }}>
                    {/* Animated Dashed Center Road Line */}
                    <div style={{
                      position: "absolute",
                      width: "100%",
                      height: "3px",
                      background: "repeating-linear-gradient(90deg, #f97316 0px, #f97316 20px, transparent 20px, transparent 40px)",
                      animation: "moveRoad 0.75s linear infinite"
                    }} />
                  </div>

                  {/* Moving Packyatra Delivery Truck Component */}
                  <motion.div
                    animate={{ 
                      y: [0, -3, 0],
                      rotate: [0, 0.5, -0.5, 0]
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      position: "absolute",
                      bottom: "26px",
                      left: "15%",
                      display: "flex",
                      alignItems: "flex-end",
                      zIndex: 2,
                    }}
                  >
                    {/* Truck Cabin & Bed */}
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      {/* Truck Trailer Container */}
                      <div style={{
                        width: "120px",
                        height: "50px",
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        borderRadius: "8px 4px 4px 8px",
                        border: "1.5px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                      }}>
                        <div style={{
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: "900",
                          letterSpacing: "1.5px",
                          fontFamily: "sans-serif",
                          textTransform: "uppercase"
                        }}>
                          PACKYATRA
                        </div>
                        <div style={{
                          fontSize: "7px",
                          color: "rgba(255, 255, 255, 0.8)",
                          fontWeight: "600",
                          letterSpacing: "0.5px"
                        }}>
                          PACKERS & MOVERS
                        </div>

                        {/* Truck shiny glass shine */}
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "50%",
                          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)",
                          pointerEvents: "none"
                        }} />
                      </div>

                      {/* Cabin Connector Linkage */}
                      <div style={{ width: "6px", height: "14px", background: "#334155", marginBottom: "4px" }} />

                      {/* Truck Cabin Front */}
                      <div style={{
                        width: "42px",
                        height: "40px",
                        background: "#f1f5f9",
                        borderRadius: "2px 14px 4px 2px",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "flex-end"
                      }}>
                        {/* Cabin Window */}
                        <div style={{
                          width: "20px",
                          height: "16px",
                          background: "#0f172a",
                          borderTopRightRadius: "8px",
                          marginRight: "4px",
                          marginTop: "4px",
                          position: "relative",
                          overflow: "hidden"
                        }}>
                          {/* Window reflection */}
                          <div style={{
                            position: "absolute",
                            top: -10,
                            left: -10,
                            width: "200%",
                            height: "200%",
                            background: "linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.3) 50%, transparent 55%)",
                            animation: "shineReflection 2s infinite"
                          }} />
                        </div>

                        {/* Front headlight orange light cone */}
                        <div style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "-2px",
                          width: "6px",
                          height: "6px",
                          background: "#facc15",
                          borderRadius: "50%",
                          boxShadow: "0 0 15px 4px #facc15"
                        }} />

                        {/* Actual Light Beam Cone */}
                        <div style={{
                          position: "absolute",
                          bottom: "-6px",
                          right: "-120px",
                          width: "120px",
                          height: "36px",
                          background: "linear-gradient(90deg, rgba(250, 204, 21, 0.35) 0%, rgba(250, 204, 21, 0) 100%)",
                          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 65%)",
                          pointerEvents: "none"
                        }} />
                      </div>
                    </div>

                    {/* Truck Wheels */}
                    <div style={{
                      position: "absolute",
                      bottom: "-8px",
                      left: "18px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#0f172a",
                      border: "3px solid #64748b",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#cbd5e1",
                        position: "relative",
                        animation: "spinWheel 0.3s linear infinite"
                      }}>
                        <div style={{ position: "absolute", top: "0", left: "3px", width: "2px", height: "8px", background: "#334155" }} />
                        <div style={{ position: "absolute", top: "3px", left: "0", width: "8px", height: "2px", background: "#334155" }} />
                      </div>
                    </div>

                    <div style={{
                      position: "absolute",
                      bottom: "-8px",
                      left: "86px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#0f172a",
                      border: "3px solid #64748b",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#cbd5e1",
                        position: "relative",
                        animation: "spinWheel 0.3s linear infinite"
                      }}>
                        <div style={{ position: "absolute", top: "0", left: "3px", width: "2px", height: "8px", background: "#334155" }} />
                        <div style={{ position: "absolute", top: "3px", left: "0", width: "8px", height: "2px", background: "#334155" }} />
                      </div>
                    </div>

                    <div style={{
                      position: "absolute",
                      bottom: "-8px",
                      left: "138px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#0f172a",
                      border: "3px solid #64748b",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#cbd5e1",
                        position: "relative",
                        animation: "spinWheel 0.3s linear infinite"
                      }}>
                        <div style={{ position: "absolute", top: "0", left: "3px", width: "2px", height: "8px", background: "#334155" }} />
                        <div style={{ position: "absolute", top: "3px", left: "0", width: "8px", height: "2px", background: "#334155" }} />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Column containing FixedMovingForm */}
                <div style={{ display: "flex", justifyContent: "center", width: "100%", position: "relative" }}>
                  {!isModalOpen && (
                    <FixedMovingForm
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      fromAddress={fromAddress}
                      setFromAddress={setFromAddress}
                      toAddress={toAddress}
                      setToAddress={setToAddress}
                      shiftingDate={shiftingDate}
                      setShiftingDate={setShiftingDate}
                      selectedCity={selectedCity}
                      setSelectedCity={setSelectedCity}
                      error={error}
                      setError={setError}
                      shiftFromSuggestion={shiftFromSuggestion}
                      setShiftFromSuggestion={setShiftFromSuggestion}
                      shiftingToSuggestion={shiftingToSuggestion}
                      setShiftingToSuggestion={setShiftingToSuggestion}
                      fetchAddressSuggestions={fetchAddressSuggestions}
                      handleCheckPricesAdmin={handleCheckPricesAdmin}
                      fromCoords={fromCoords}
                      setFromCoords={setFromCoords}
                      toCoords={toCoords}
                      setToCoords={setToCoords}
                    />
                  )}
                </div>
              </div>
            </div>

            <style>{`
              @keyframes moveRoad {
                0% { background-position: 0px 0; }
                100% { background-position: -40px 0; }
              }
              @keyframes spinWheel {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes shineReflection {
                0% { transform: translate(-30px, -30px) rotate(45deg); }
                40%, 100% { transform: translate(30px, 30px) rotate(45deg); }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.5; }
              }
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </section>

          <Modal
            isOpen={isModalOpen}
            closeModal={closeModal}
            distance={distance}
            activeTab={activeTab}
            shiftingDate={shiftingDate}
            fromAddress={fromAddress}
            toAddress={toAddress}
            onLoginStatusChange={onLoginStatusChange}
          />

          {/* Enhanced Services Section */}
          <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
            <div className="container" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <span 
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#f97316",
                  backgroundColor: "#fff7ed",
                  padding: "6px 14px",
                  borderRadius: "30px",
                  display: "inline-block",
                  marginBottom: "1rem"
                }}
              >
                ✨ Relocation Excellence
              </span>
              <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: "800", color: "#0f172a", marginBottom: "1rem", fontFamily: "'Poppins', sans-serif" }}>
                Our Comprehensive Services
              </h2>
              <p style={{ fontSize: "1.05rem", color: "#64748b", maxWidth: "650px", margin: "0 auto 2.5rem" }}>
                Complete packing and moving solutions tailored to your specific relocation needs with guaranteed security.
              </p>

              {/* Filtering Tabs */}
              <div 
                style={{ 
                  display: "inline-flex", 
                  backgroundColor: "#f1f5f9", 
                  padding: "6px", 
                  borderRadius: "16px",
                  gap: "8px",
                  marginBottom: "3rem",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                  flexWrap: "wrap",
                  justifyContent: "center"
                }}
              >
                {[
                  { id: "all", label: "All Services" },
                  { id: "shifting", label: "Shifting Solutions" },
                  { id: "commercial", label: "Corporate & Transport" },
                  { id: "storage", label: "Packing & Care" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveServiceTab(tab.id)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: activeServiceTab === tab.id ? "#ffffff" : "transparent",
                      color: activeServiceTab === tab.id ? "#0f172a" : "#64748b",
                      boxShadow: activeServiceTab === tab.id ? "0 4px 12px rgba(15, 23, 42, 0.05)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Container */}
            <div className="container">
              <motion.div 
                layout 
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "30px",
                  padding: "0 10px"
                }}
              >
                {filteredServices.map((service, index) => (
                  <ServiceCard
                    key={service.title}
                    icon={service.icon}
                    title={service.title}
                    desc={service.desc}
                    features={service.features}
                    badge={service.badge}
                    accentColor={service.accentColor}
                    onSelect={() => handleServiceSelect(service.title)}
                  />
                ))}
              </motion.div>
            </div>
          </section>

          <section className="features-section" style={{ background: "#0f172a", padding: "80px 24px", color: "#ffffff" }}>
            <div className="container section-title" style={{ textAlign: "center", marginBottom: "48px" }}>
              <span style={{
                background: "rgba(249, 115, 22, 0.1)",
                color: "#f97316",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                padding: "6px 16px",
                borderRadius: "20px",
                border: "1px solid rgba(249, 115, 22, 0.2)",
                display: "inline-block",
                marginBottom: "16px"
              }}>
                OUR COMMITMENT
              </span>
              <h2 style={{
                fontSize: "36px",
                fontWeight: "800",
                color: "#ffffff",
                marginBottom: "12px",
                letterSpacing: "-0.025em"
              }}>
                Why Choose Packyatra?
              </h2>
              <p style={{
                fontSize: "16px",
                color: "#94a3b8",
                maxWidth: "540px",
                margin: "0 auto",
                lineHeight: "1.5"
              }}>
                Trusted by thousands of customers across India for hassle-free, secure, and professional relocation services.
              </p>
            </div>

            <div className="full-width-grid features-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              maxWidth: "1200px",
              margin: "0 auto"
            }}>
              <Feature icon={faShieldAlt} title="100% Insured" desc="Complete transit insurance coverage for peace of mind." />
              <Feature icon={faHandshake} title="Transparent Pricing" desc="Clear, honest quotes upfront. Zero hidden charges, ever." />
              <Feature icon={faUsers} title="Expert Staff" desc="Highly trained, background-checked moving professionals." />
              <Feature icon={faTruck} title="Nationwide Network" desc="Seamless relocation services across 50+ major cities." />
              <Feature icon={faCheck} title="Timely Delivery" desc="Strict adherence to schedules with an on-time guarantee." />
              <Feature icon={faBoxOpen} title="Quality Packing" desc="Multi-layered premium packaging materials for maximum safety." />
            </div>
          </section>

          <section style={{ padding: "100px 24px 120px", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
            {/* Ambient Background Circles */}
            <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, rgba(255, 255, 255, 0) 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249, 115, 22, 0.03) 0%, rgba(255, 255, 255, 0) 70%)", pointerEvents: "none" }} />

            <div className="container" style={{ maxWidth: "960px", margin: "0 auto", position: "relative", zIndex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <span style={{
                  background: "rgba(249, 115, 22, 0.1)",
                  color: "#f97316",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(249, 115, 22, 0.2)",
                  display: "inline-block",
                  marginBottom: "16px"
                }}>
                  HAVE QUESTIONS?
                </span>
                <h2 style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: "12px",
                  letterSpacing: "-0.025em"
                }}>
                  Frequently Asked Questions
                </h2>
                <p style={{
                  fontSize: "16px",
                  color: "#64748b",
                  maxWidth: "540px",
                  margin: "0 auto",
                  lineHeight: "1.5"
                }}>
                  Find quick answers to common queries about our packing, moving, pricing, and insurance services.
                </p>
              </div>

              {/* Modern Search & Filtering Controls */}
              <div style={{
                background: "#ffffff",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
                border: "1px solid #e2e8f0",
                marginBottom: "40px"
              }}>
                {/* Search Bar */}
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }} />
                  <input
                    type="text"
                    placeholder="Search your question (e.g., insurance, cost, packing)..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "16px 48px 16px 48px",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#0f172a",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.01)"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#f97316"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                  {faqSearch && (
                    <button
                      onClick={() => setFaqSearch("")}
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>

                {/* Horizontal Category Tabs */}
                <div style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  scrollbarWidth: "none"
                }} className="hide-scrollbar">
                  {faqCategories.map((category) => {
                    const isActive = selectedFaqCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedFaqCategory(category)}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "12px",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          background: isActive ? "#f97316" : "transparent",
                          color: isActive ? "#ffffff" : "#64748b",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "#f1f5f9";
                            e.currentTarget.style.color = "#0f172a";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#64748b";
                          }
                        }}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accordion List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <AnimatePresence mode="popLayout">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                      const isOpen = activeFaq === faq.q;
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          key={faq.q}
                          style={{
                            background: "#ffffff",
                            borderRadius: "18px",
                            border: isOpen ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid #e2e8f0",
                            boxShadow: isOpen 
                              ? "0 10px 25px -5px rgba(249, 115, 22, 0.1), 0 8px 10px -6px rgba(249, 115, 22, 0.05)" 
                              : "0 4px 6px -1px rgba(15, 23, 42, 0.02), 0 2px 4px -2px rgba(15, 23, 42, 0.02)",
                            overflow: "hidden",
                            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          {/* Accordion Header Button */}
                          <div
                            onClick={() => toggleFaq(faq.q)}
                            style={{
                              padding: "20px 24px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "pointer",
                              userSelect: "none",
                              background: isOpen ? "rgba(249, 115, 22, 0.02)" : "transparent",
                              transition: "background-color 0.3s ease"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingRight: "16px" }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                background: isOpen ? "rgba(249, 115, 22, 0.1)" : "#f1f5f9",
                                color: isOpen ? "#f97316" : "#64748b",
                                flexShrink: 0,
                                transition: "all 0.3s ease"
                              }}>
                                <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: "14px" }} />
                              </div>
                              <span style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: isOpen ? "#f97316" : "#0f172a",
                                transition: "color 0.3s ease",
                                lineHeight: "1.4",
                                textAlign: "left"
                              }}>
                                {faq.q}
                              </span>
                            </div>

                            {/* Chevron Indicator */}
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: isOpen ? "#f97316" : "#f1f5f9",
                              color: isOpen ? "#ffffff" : "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                              flexShrink: 0
                            }}>
                              <FontAwesomeIcon 
                                icon={faChevronDown} 
                                style={{ 
                                  fontSize: "12px", 
                                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
                                  transition: "transform 0.3s ease" 
                                }} 
                              />
                            </div>
                          </div>

                          {/* Accordion Answer Wrapper */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                style={{ overflow: "hidden" }}
                              >
                                <div style={{
                                  padding: "0 24px 24px 72px",
                                  fontSize: "15px",
                                  color: "#475569",
                                  lineHeight: "1.6",
                                  borderTop: "1px solid #f1f5f9",
                                  textAlign: "left"
                                }}>
                                  <p style={{ margin: 0, whiteSpace: "pre-line" }}>
                                    {faq.a}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        textAlign: "center",
                        padding: "64px 32px",
                        background: "#ffffff",
                        borderRadius: "24px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01)"
                      }}
                    >
                      <div style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#f1f5f9",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        fontSize: "20px"
                      }}>
                        <FontAwesomeIcon icon={faQuestionCircle} />
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                        No Frequently Asked Questions Found
                      </h3>
                      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                        We couldn't find any FAQs matching "{faqSearch}" in the "{selectedFaqCategory}" category.
                      </p>
                      <button
                        onClick={() => {
                          setFaqSearch("");
                          setSelectedFaqCategory("All");
                        }}
                        style={{
                          background: "#f97316",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(249, 115, 22, 0.3)"
                        }}
                      >
                        Reset Filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ icon, title, desc, features, badge, accentColor, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define accent styles
  const colors = {
    orange: { bg: "#fff7ed", border: "#ffedd5", text: "#ea580c", iconBg: "linear-gradient(135deg, #f97316, #ea580c)" },
    blue: { bg: "#eff6ff", border: "#dbeafe", text: "#2563eb", iconBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
    green: { bg: "#f0fdf4", border: "#dcfce7", text: "#16a34a", iconBg: "linear-gradient(135deg, #22c55e, #15803d)" },
    purple: { bg: "#faf5ff", border: "#f3e8ff", text: "#9333ea", iconBg: "linear-gradient(135deg, #a855f7, #7e22ce)" },
    red: { bg: "#fef2f2", border: "#fee2e2", text: "#dc2626", iconBg: "linear-gradient(135deg, #ef4444, #b91c1c)" },
    teal: { bg: "#f0fdfa", border: "#ccfbf1", text: "#0d9488", iconBg: "linear-gradient(135deg, #14b8a6, #0f766e)" },
  };

  const scheme = colors[accentColor] || colors.orange;

  return (
    <motion.div
      className="service-card-premium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "2.5rem 2rem",
        boxShadow: isHovered 
          ? "0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.03)" 
          : "0 10px 30px rgba(15, 23, 42, 0.04)",
        border: `1px solid ${isHovered ? "#f97316" : "#e2e8f0"}`,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minWidth: "100%",
        cursor: "pointer",
        overflow: "hidden"
      }}
      whileHover={{ y: -6 }}
      layout
    >
      {/* Background Decorative Accent */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${scheme.bg} 0%, rgba(255,255,255,0) 70%)`,
          opacity: isHovered ? 1 : 0.5,
          transition: "opacity 0.3s ease",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <div>
        {/* Top Header Row with Icon and Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", zIndex: 1, position: "relative" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: scheme.iconBg,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
              transform: isHovered ? "scale(1.08) rotate(3deg)" : "scale(1)",
              transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
          >
            <FontAwesomeIcon icon={icon} />
          </div>

          {badge && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: scheme.text,
                backgroundColor: scheme.bg,
                border: `1px solid ${scheme.border}`,
                padding: "6px 12px",
                borderRadius: "30px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div style={{ zIndex: 1, position: "relative" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Poppins', sans-serif" }}>
            {title}
          </h3>
          <p style={{ fontSize: "0.95rem", color: "#64748b", lineHeight: "1.55", marginBottom: "1.5rem", minHeight: "3rem" }}>
            {desc}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "1.25rem 0", width: "100%" }} />

        {/* Features List */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.75rem", zIndex: 1, position: "relative" }}>
          {features.map((f, i) => (
            <motion.li
              key={i}
              style={{
                fontSize: "0.9rem",
                color: "#334155",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "500"
              }}
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <FontAwesomeIcon icon={faCheck} style={{ color: "#15803d", fontSize: "10px" }} />
              </div>
              <span>{f}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Booking CTA Button */}
      <div style={{ zIndex: 1, position: "relative" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: "12px",
            background: isHovered ? "#f97316" : "#f8fafc",
            color: isHovered ? "#ffffff" : "#475569",
            border: `1px solid ${isHovered ? "#ea580c" : "#e2e8f0"}`,
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <span>Calculate Shifting Cost</span>
          <FontAwesomeIcon 
            icon={faChevronDown} 
            style={{ 
              fontSize: "11px", 
              transform: isHovered ? "translateY(2px)" : "rotate(-90deg)", 
              transition: "transform 0.3s ease" 
            }} 
          />
        </button>
      </div>
    </motion.div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ 
      y: -8, 
      borderColor: "rgba(249, 115, 22, 0.4)",
      boxShadow: "0 20px 40px -15px rgba(249, 115, 22, 0.25), 0 0 1px rgba(249, 115, 22, 0.4)"
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "24px",
      padding: "36px 28px",
      textAlign: "center",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(12px)",
      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
    }}
  >
    <div style={{
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.15) 100%)",
      border: "1px solid rgba(249, 115, 22, 0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      color: "#f97316",
      fontSize: "24px",
      boxShadow: "0 8px 16px -4px rgba(234, 88, 12, 0.15)"
    }}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <h3 style={{
      fontSize: "17px",
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: "8px",
      letterSpacing: "-0.01em"
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: "13.5px",
      color: "#94a3b8",
      lineHeight: "1.5",
      margin: 0
    }}>
      {desc}
    </p>
  </motion.div>
);

const Stat = ({ number, text }) => (
  <div className="stat-item">
    <div className="stat-number">{number}</div>
    <div className="stat-text">{text}</div>
  </div>
);
const faqData = [
  {
    category: "Pricing & Booking",
    q: "How much does packing and moving cost?",
    a: "Pricing depends on distance, volume and services. Local moves start from ₹1,000.",
  },
  {
    category: "Safety & Insurance",
    q: "Is insurance included?",
    a: "Yes, all shipments are fully insured.",
  },
  {
    category: "Our Process",
    q: "How long does the moving process take?",
    a: "Local moves typically take same days, long-distance moves depends on KM.",
  },
  {
    category: "Our Process",
    q: "Do you provide packing materials?",
    a: "Yes, we use high-quality packing materials to ensure safety.",
  },
  {
    category: "Safety & Insurance",
    q: "Can I track my shipment?",
    a: "Yes, we provide tracking facilities for all shipments.",
  },
  {
    category: "General",
    q: "What areas do you serve?",
    a: "We operate in over 50 cities across India.",
  },
  {
    category: "Pricing & Booking",
    q: "How do I get a quote?",
    a: "You can get a free quote by contacting us via phone, email or our website.",
  },
  {
    category: "Pricing & Booking",
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, net banking and UPI.",
  },
  {
    category: "Pricing & Booking",
    q: "What if I need to reschedule my move?",
    a: "You can reschedule up to 24 hours before the move date without any charges.",
  },
  {
    category: "Our Process",
    q: "Are there any items you do not move?",
    a: "We do not transport hazardous materials.",
  },
  {
    category: "General",
    q: "How experienced is your staff?",
    a: "Our team has over 16 years of experience in the packing and moving industry.",
  },
  {
    category: "Our Process",
    q: "Can I get help with unpacking?",
    a: "Yes, we offer unpacking services at your new location.",
  },
  {
    category: "General",
    q: "Do you offer storage solutions?",
    a: "Yes, we provide secure short-term and long-term storage options.",
  },
  {
    category: "General",
    q: "How do I prepare for my move?",
    a: "We provide a detailed moving checklist to help you prepare efficiently.",
  },
  {
    category: "Safety & Insurance",
    q: "What if something gets damaged during the move?",
    a: "In the unlikely event of damage, our insurance policy covers repairs or replacements.",
  },
  {
    category: "General",
    q: "Can I customize my moving package?",
    a: "Yes, we offer customizable packages to suit your specific needs and budget.",
  },
  {
    category: "Pricing & Booking",
    q: "How do I book your services?",
    a: "You can book our services online through our website or by calling our customer service.",
  },
  {
    category: "General",
    q: "What sets Packyatra apart from other movers?",
    a: "We offer personalized service, competitive pricing, and a commitment to safety and reliability."
  },
  {
    category: "Pricing & Booking",
    q: "Why should I pay token in advance before the move?",
    a: "Paying a token helps secure your move date and ensures priority service."
  }
];

export default HomeSelection;
