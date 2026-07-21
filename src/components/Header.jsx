import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button, Dialog, DialogContent } from "@mui/material";
import { Phone, Mail, LogIn, Truck, MessageSquare } from "lucide-react";
import axiosClient from "../AxiosClient.jsx";
import TrackShipment from "../pages/TrackShipment.jsx";
import OtpLogin from "../components/OtpLogin.jsx";
import UserDropdown from "./UserDropdown.jsx";
import { getUserInfo, isOtpValid, clearLoginData } from "../utils/auth";
import "../styles/Header.css";

const Header = ({ onLoginStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* ======================
     AUTO CLOSE ON ROUTE CHANGE
  ====================== */
  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = "auto";
  }, [location.pathname]);

  /* ======================
     BODY SCROLL LOCK
  ====================== */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [menuOpen]);

  /* ======================
     ESC KEY CLOSE
  ====================== */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  /* ======================
     DESKTOP RESIZE FIX
  ====================== */
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth >= 900) setMenuOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ======================
     LOAD USER
  ====================== */
  useEffect(() => {
    const loadUser = () => {
      const userInfo = getUserInfo();
      
      if (userInfo) {
        setUser(userInfo);
        onLoginStatusChange?.(true);
      } else {
        setUser(null);
        onLoginStatusChange?.(false);
      }
    };

    loadUser();
    
    // Listen for login/logout events
    window.addEventListener("user-login", loadUser);
    window.addEventListener("user-logout", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("user-login", loadUser);
      window.removeEventListener("user-logout", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, [onLoginStatusChange]);

  /* ======================
     HANDLERS
  ====================== */
  const openLogin = () => {
    setMenuOpen(false);
    
    // Check if already logged in
    if (isOtpValid()) {
      // Already logged in, no need to show modal
      const userInfo = getUserInfo();
      if (userInfo && !user) {
        setUser(userInfo);
        onLoginStatusChange?.(true);
      }
      return;
    }
    
    setIsLoginModalOpen(true);
  };

  const openTrackShipment = () => {
    setMenuOpen(false);
    setIsTrackModalOpen(true);
  };

  const handleLogout = () => {
    clearLoginData();
    setUser(null);
    onLoginStatusChange?.(false);
    navigate("/");
    setMenuOpen(false);
  };
const handleLogoutFromDropdown = () => {
    setUser(null);
    onLoginStatusChange?.(false);
    // UserDropdown handles the actual logout logic (clear localStorage, etc.)
    // We just need to update our local state here
  };

 
  /* ======================
     JSX
  ====================== */
  return (
    <header className="site-header">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="contact-top">
            <span className="contact-item">
              <Phone size={13} className="contact-icon" />
              <a href="tel:+919071535535">+91 90715 35535</a>
            </span>
            <span className="contact-divider">•</span>
            <span className="contact-item">
              <Mail size={13} className="contact-icon" />
              <a href="mailto:info@packyatra.com">info@packyatra.com</a>
            </span>
          </div>
          <div className="top-bar-right">
            <UserDropdown onLogout={handleLogoutFromDropdown} />
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="header">
        <div className="header-container">
          {/* LOGO */}
          <div className="logo-container" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="logo-icon-wrapper">
              <Truck className="logo-icon" size={24} />
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-brand-pack">PACK</span>
              <span className="logo-brand-yatra">YATRA</span>
              <span className="logo-brand-sub">Relocation Pvt. Ltd.</span>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="desktop-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Contact
            </NavLink>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="header-actions">
            {!user ? (
              <button className="header-login-btn" onClick={openLogin}>
                <LogIn size={14} />
                <span>Login / Signup</span>
              </button>
            ) : (
              <span className="user-logged-badge">
                <span className="status-dot"></span>
                Logged In
              </span>
            )}
          </div>

          {/* HAMBURGER */}
          <button
            className={`mobile-menu-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* OVERLAY */}
        {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}

        {/* MOBILE MENU */}
        <nav className={`nav-container ${menuOpen ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <div className="logo-container">
              <span className="logo-brand-pack">PACK</span>
              <span className="logo-brand-yatra">YATRA</span>
            </div>
          </div>
          <ul className="mobile-nav-links">
            <li>
              <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>
                Contact Support
              </NavLink>
            </li>
            <li className="whatsapp-li">
              <a href="https://wa.me/9071535535" target="_blank" rel="noreferrer" className="whatsapp-cta">
                <MessageSquare size={16} />
                <span>Continue on WhatsApp</span>
              </a>
            </li>
          </ul>

          <div className="mobile-actions">
            {!user && (
              <button className="mobile-login-btn" onClick={openLogin}>
                <LogIn size={16} />
                <span>Login / Signup</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* LOGIN MODAL */}
      <Dialog
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <OtpLogin 
            onSuccess={() => {
              setIsLoginModalOpen(false);
            }}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* TRACK SHIPMENT MODAL */}
      <Dialog
        open={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <TrackShipment onClose={() => setIsTrackModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;