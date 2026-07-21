import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearLoginData, getUserInfo } from "../utils/auth";
import "../../styles/UserDropdown.css";

const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
    
    const handleStorageChange = () => {
      setUser(getUserInfo());
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-login", handleStorageChange);
    window.addEventListener("user-logout", handleStorageChange);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-login", handleStorageChange);
      window.removeEventListener("user-logout", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    clearLoginData();
    setUser(null);
    onLogout?.();
    setIsOpen(false);
    navigate("/");
    window.dispatchEvent(new Event("user-logout"));
  };

  const handleMenuItemClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Don't show dropdown if not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="right-section" ref={dropdownRef}>
      <div className="user-info" onClick={toggleDropdown}>
        <i className="fas fa-user-circle"></i>
        <span>Hi, {user.mobile}</span>
        <i className={`fas fa-chevron-down ${isOpen ? 'rotate' : ''}`}></i>
      </div>
      
      {/* Overlay - Only show when dropdown is open */}
      {isOpen && (
        <div 
          className="dropdown-overlay active" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <i className="fas fa-user-circle"></i>
            {user.name}
          </div>
          
          <div 
            className="dropdown-item"
            onClick={() => handleMenuItemClick("/profile")}
          >
            <i className="fas fa-user"></i>
            <span>My Profile</span>
          </div>
          
          <div 
            className="dropdown-item"
            onClick={() => handleMenuItemClick("/settings")}
          >
            <i className="fas fa-cog"></i>
            <span>Account Settings</span>
          </div>
          
          <div 
            className="dropdown-item"
            onClick={() => handleMenuItemClick("/bookings")}
          >
            <i className="fas fa-suitcase"></i>
            <span>My Bookings</span>
          </div>
          
          <div 
            className="dropdown-item"
            onClick={() => handleMenuItemClick("/track-shipment")}
          >
            <i className="fas fa-map-marker-alt"></i>
            <span>Track Shipment</span>
          </div>
          
          <div 
            className="dropdown-item"
            onClick={() => handleMenuItemClick("/help")}
          >
            <i className="fas fa-question-circle"></i>
            <span>Help & Support</span>
          </div>
          
          <div 
            className="dropdown-item logout"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;