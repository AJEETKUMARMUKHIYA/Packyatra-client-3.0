import React, { useState } from "react";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMapMarkerAlt, 
  faLocationArrow, 
  faCalendarAlt, 
  faChevronRight, 
  faShieldAlt, 
  faCheckCircle,
  faInfoCircle 
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Cityddl.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const bangloreImg = "/Images/Banglore.png";

const cities = [
  { name: "Bangalore", img: bangloreImg },
];

const FixedMovingForm = ({
  activeTab,
  setActiveTab,
  fromAddress,
  setFromAddress,
  toAddress,
  setToAddress,
  shiftingDate,
  setShiftingDate,
  selectedCity,
  setSelectedCity,
  error,
  setError, // ADDED THIS
  shiftFromSuggestion,
  setShiftFromSuggestion,
  shiftingToSuggestion,
  setShiftingToSuggestion,
  fetchAddressSuggestions,
  handleCheckPrices,
  fromCoords,
  setFromCoords,
  toCoords,
  setToCoords,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  
  useEffect(() => {
    setToAddress("");
    setShiftingToSuggestion([]);
    setError(""); // Clear error when tab changes
  }, [activeTab]);

  return (
    <aside className="right-section fixed-form">
      <div className="form-container-premium" style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "24px 20px",
        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 1px rgba(15, 23, 42, 0.2)",
        border: "1px solid #e2e8f0",
        maxWidth: "360px",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Top Trust Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <span style={{
            background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
            color: "#ea580c",
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
            padding: "5px 14px",
            borderRadius: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid #fed7aa"
          }}>
            <FontAwesomeIcon icon={faShieldAlt} /> Secure Relocation Quote
          </span>
        </div>

        <h2 style={{
          fontSize: "19px",
          fontWeight: "800",
          textAlign: "center",
          color: "#0f172a",
          marginBottom: "4px",
          lineHeight: "1.3",
          letterSpacing: "-0.02em"
        }}>
          Planning to Relocate?
        </h2>
        
        <p style={{
          fontSize: "12.5px",
          color: "#64748b",
          textAlign: "center",
          marginBottom: "16px",
          lineHeight: "1.4"
        }}>
          Enter details to calculate live shifting prices instantly.
        </p>
        
        {/* Tabs */}
        <div style={{
          display: "flex",
          background: "#f1f5f9",
          padding: "5px",
          borderRadius: "14px",
          marginBottom: "22px",
          border: "1px solid #e2e8f0"
        }}>
          <button
            onClick={() => {
              setActiveTab("within");
              setFromAddress("");
              setToAddress("");
              setFromCoords(null);
              setToCoords(null);
              setShiftFromSuggestion([]);
              setShiftingToSuggestion([]);
              setError("");
            }}
            style={{
              flex: 1,
              border: "none",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "within" ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "transparent",
              color: activeTab === "within" ? "#ffffff" : "#64748b",
              boxShadow: activeTab === "within" ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none"
            }}
          >
            Within city
          </button>

          <button
            onClick={() => {
              setActiveTab("between");
              setFromAddress("");
              setToAddress("");
              setFromCoords(null);
              setToCoords(null);
              setShiftFromSuggestion([]);
              setShiftingToSuggestion([]);
              setError("");
            }}
            style={{
              flex: 1,
              border: "none",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "between" ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "transparent",
              color: activeTab === "between" ? "#ffffff" : "#64748b",
              boxShadow: activeTab === "between" ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none"
            }}
          >
            Between cities
          </button>
        </div>

        {/* City Selector */}
        {activeTab === "within" && (
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "700",
              color: "#334155",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "6px"
            }}>
              Select your city
            </label>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "12px",
                border: dropdownOpen ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                background: "#ffffff",
                cursor: "pointer",
                boxShadow: dropdownOpen ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {selectedCity ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={cities.find(c => c.name === selectedCity)?.img} alt={selectedCity} style={{ width: "24px", height: "24px" }} />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{selectedCity}</span>
                </div>
              ) : (
                <span style={{ fontSize: "14px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: "#94a3b8" }} /> Select a city
                </span>
              )}
              <span style={{ fontSize: "11px", color: "#64748b" }}>{dropdownOpen ? "▲" : "▼"}</span>
            </div>

            {dropdownOpen && (
              <div style={{
                marginTop: "8px",
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "8px",
                background: "#f8fafc",
                padding: "8px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0"
              }}>
                {cities.map(city => (
                  <div
                    key={city.name}
                    onClick={() => {
                      setSelectedCity(city.name);
                      setDropdownOpen(false);
                      setError("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: selectedCity === city.name ? "#eff6ff" : "transparent",
                      border: selectedCity === city.name ? "1px solid #bfdbfe" : "1px solid transparent",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <img src={city.img} alt={city.name} style={{ width: "28px", height: "28px" }} />
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>{city.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: "10px",
            padding: "8px 12px",
            marginBottom: "16px"
          }}>
            <FontAwesomeIcon icon={faInfoCircle} style={{ color: "#ef4444", fontSize: "13px" }} />
            <span style={{ color: "#b91c1c", fontSize: "12.5px", fontWeight: "500" }}>{error}</span>
          </div>
        )}

        {/* Shifting From */}
        <div style={{ marginBottom: "18px", position: "relative" }}>
          <label style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            color: "#334155",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "6px"
          }}>
            Shifting from
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ea580c",
              fontSize: "14px",
              zIndex: 1
            }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </span>
            <input
              type="text"
              placeholder="Enter pickup location"
              value={fromAddress}
              onFocus={() => setFromFocused(true)}
              onBlur={() => setTimeout(() => setFromFocused(false), 200)}
              onChange={(e) => {
                const val = e.target.value;
                setFromAddress(val);
                setFromCoords(null); // Clear coordinates when typing
                setError(""); // Clear error
                fetchAddressSuggestions(val, setShiftFromSuggestion, selectedCity);
              }}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "12px",
                border: fromFocused ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                background: "#ffffff",
                boxShadow: fromFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none"
              }}
            />
          </div>
          {shiftFromSuggestion.length > 0 && (
            <div className="suggestions" style={{
              position: "absolute",
              width: "100%",
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              marginTop: "4px",
              zIndex: 9999,
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {shiftFromSuggestion.map((p, i) => (
                <div
                  key={i}
                  className="suggestion-item"
                  onClick={() => {
                    setFromAddress(p.properties?.formatted || "");
                    setFromCoords({ lat: p.properties?.lat, lon: p.properties?.lon });
                    setShiftFromSuggestion([]);
                    setError(""); // Clear error when selecting
                  }}
                  style={{
                    padding: "11px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    color: "#334155",
                    cursor: "pointer",
                    borderBottom: i < shiftFromSuggestion.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.15s ease"
                  }}
                >
                  <FontAwesomeIcon icon={faLocationArrow} style={{ color: "#2563eb", fontSize: "12px" }} />
                  <span style={{ fontWeight: "500" }}>{p.properties?.formatted}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shifting To */}
        <div style={{ marginBottom: "18px", position: "relative" }}>
          <label style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            color: "#334155",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "6px"
          }}>
            Shifting to
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#16a34a",
              fontSize: "14px",
              zIndex: 1
            }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </span>
            <input
              type="text"
              placeholder="Enter delivery location"
              value={toAddress}
              onFocus={() => setToFocused(true)}
              onBlur={() => setTimeout(() => setToFocused(false), 200)}
              onChange={(e) => {
                const val = e.target.value;
                setToAddress(val);
                setToCoords(null); // Clear coordinates when typing
                setError(""); // Clear error
                fetchAddressSuggestions(val, setShiftingToSuggestion, selectedCity);
              }}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "12px",
                border: toFocused ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                background: "#ffffff",
                boxShadow: toFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none"
              }}
            />
          </div>
          {shiftingToSuggestion.length > 0 && (
            <div className="suggestions" style={{
              position: "absolute",
              width: "100%",
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              marginTop: "4px",
              zIndex: 9999,
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {shiftingToSuggestion.map((p, i) => (
                <div
                  key={i}
                  className="suggestion-item"
                  onClick={() => {
                    setToAddress(p.properties?.formatted || "");
                    setToCoords({ lat: p.properties?.lat, lon: p.properties?.lon });
                    setShiftingToSuggestion([]);
                    setError(""); // Clear error when selecting
                  }}
                  style={{
                    padding: "11px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    color: "#334155",
                    cursor: "pointer",
                    borderBottom: i < shiftingToSuggestion.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.15s ease"
                  }}
                >
                  <FontAwesomeIcon icon={faLocationArrow} style={{ color: "#2563eb", fontSize: "12px" }} />
                  <span style={{ fontWeight: "500" }}>{p.properties?.formatted}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div style={{ marginBottom: "26px" }}>
          <label style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            color: "#334155",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "6px"
          }}>
            Select shifting date
          </label>
          <div style={{ position: "relative" }} className="date-input-wrapper-premium">
            <span style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: "14px",
              zIndex: 1,
              pointerEvents: "none"
            }}>
              <FontAwesomeIcon icon={faCalendarAlt} />
            </span>
            <DatePicker
              selected={shiftingDate}
              onChange={(date) => setShiftingDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="dd-mm-yyyy"
              className="date-input"
              value={shiftingDate}
              minDate={new Date()}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "12px",
                border: "1.5px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button 
          className="submit-btn" 
          onClick={handleCheckPrices}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#ffffff",
            border: "none",
            borderRadius: "14px",
            padding: "14px 20px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 10px 20px -5px rgba(234, 88, 12, 0.3), 0 4px 6px -2px rgba(234, 88, 12, 0.05)",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <span>Calculate Shifting Cost</span>
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "12px" }} />
        </button>

        {/* Premium Trust Indicators Footer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "22px",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
            <FontAwesomeIcon icon={faShieldAlt} style={{ color: "#16a34a" }} /> Safe Delivery
          </span>
          <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#2563eb" }} /> Insured Shifting
          </span>
        </div>
      </div>
    </aside>
  );
};

export default FixedMovingForm;