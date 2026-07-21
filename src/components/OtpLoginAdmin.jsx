import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  ShieldCheck, 
  Star, 
  MapPin, 
  X, 
  Loader2, 
  Award, 
  CheckCircle,
  Shield,
  ArrowRight
} from "lucide-react";
import axiosClient from "../AxiosClient";
import { checkAndCreateUser } from "../utils/userService";
import { isOtpValid } from "../utils/auth";
import "../styles/Login.css";

const moviingTeam = "/Images/moving-team.webp";

const OtpLoginAdmin = ({ onSuccess, onClose, userData = {} }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AUTOMATICALLY CHECK IF ALREADY LOGGED IN
  useEffect(() => {
    if (isOtpValid()) {
      const savedMobile = localStorage.getItem("mobile");
      if (savedMobile) {
        // Auto-success if already logged in
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 100);
      }
    }
  }, [onSuccess, onClose]);

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    
    try {
      setLoading(true);
      setError("");       
      
      // Check/Create user in database
      const { userID, addressID } = await checkAndCreateUser(mobileNumber, userData);

      // Save login for 30 minutes
      localStorage.setItem("mobile", mobileNumber);
      localStorage.setItem("userID", userID);
      localStorage.setItem("addressID", addressID);
      localStorage.setItem("userName", "User");
      localStorage.setItem("loginType", "OTP");
      localStorage.setItem("otpLoginTime", Date.now());

      // Trigger login events
      window.dispatchEvent(new Event("user-login"));
      window.dispatchEvent(new Event("storage"));

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const errorMessage = err?.response?.data?.errors?.[0] || 
                          err?.response?.data?.title || 
                          err?.response?.data?.detail ||
                          "Failed to authenticate. Try again.";
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="login-overlay">
        <motion.div 
          className="login-overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div 
          className="login-popup"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
        >
          {/* Close Button */}
          <motion.button 
            className="close-btn-premium" 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={18} />
          </motion.button>

          {/* Left Column: Premium Interactive Panel */}
          <div className="login-image-section">
            <div className="login-image-overlay" />
            <img src={moviingTeam} alt="Moving Service" className="login-img" />
            
            {/* Elegant Floating Cards on the Left Panel */}
            <div className="floating-badge-container">
              <motion.div 
                className="floating-glass-card top-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="badge-icon-bg green">
                  <ShieldCheck size={18} />
                </div>
                <div className="badge-content">
                  <h5>Fully Insured</h5>
                  <p>100% safety guaranteed</p>
                </div>
              </motion.div>

              <motion.div 
                className="floating-glass-card bottom-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="badge-icon-bg blue">
                  <Star size={16} />
                </div>
                <div className="badge-content">
                  <h5>Rated 4.8/5</h5>
                  <p>Trusted by 10k+ families</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Admin Direct Register Form Section */}
          <div className="login-content-section">
            <div className="step-container">
              <div className="login-header-group">
                <motion.div 
                  className="brand-pill admin-pill"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  ⚡ Admin Bypass Login
                </motion.div>
                <h3 className="login-title">Register & Login</h3>
                <p className="login-subtitle">Instant authentication. OTP verification is bypassed for admin mode.</p>
              </div>

              <div className="input-field-wrapper">
                <label className="input-label">Mobile Number</label>
                <div className="phone-input-premium">
                  <span className="country-prefix">
                    <span className="flag-icon">🇮🇳</span>
                    <span className="prefix-text">+91</span>
                  </span>
                  <div className="prefix-divider" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    autoFocus
                    className="mobile-text-input"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="error-message-box"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                className="login-btn-premium" 
                onClick={sendOtp} 
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-icon" size={18} />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Instant Login</span>
                    <ArrowRight size={16} className="btn-arrow" />
                  </>
                )}
              </motion.button>

              {/* Premium Trust Indicators */}
              <div className="trust-features-grid">
                <div className="trust-feature-item">
                  <div className="feature-icon">
                    <Award size={15} />
                  </div>
                  <span>15+ Years Relocation Excellence</span>
                </div>
                <div className="trust-feature-item">
                  <div className="feature-icon">
                    <Shield size={15} />
                  </div>
                  <span>Zero-Damage Relocation Insurance</span>
                </div>
                <div className="trust-feature-item">
                  <div className="feature-icon">
                    <MapPin size={15} />
                  </div>
                  <span>Serving 10+ Cities Nationwide</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OtpLoginAdmin;
