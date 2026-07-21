import React, { useState, useEffect } from "react";
import axiosClient from "../AxiosClient";
import "../styles/Login.css";
const moviingTeam = "/Images/moving-team.webp";
const UserLogin = ({ onClose }) => {
  const [MobileNumber, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("MOBILE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // OTP AUTO FILL (WEB OTP API)
  // ==========================
  useEffect(() => {
    if (step !== "OTP") return;

    if ("OTPCredential" in window) {
      const ac = new AbortController();

      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal,
        })
        .then((otpCredential) => {
          if (otpCredential?.code) {
            setOtp(otpCredential.code);
          }
        })
        .catch(() => {});

      return () => ac.abort();
    }
  }, [step]);
  // ERROR HANDLER
  const getErrorMessage = (err) => {
    if (typeof err?.response?.data === "string") {
      return err.response.data;
    }
    if (err?.response?.data?.title) {
      return err.response.data.title;
    }
    if (err?.message) {
      return err.message;
    }
    return "Something went wrong. Please try again.";
  };
  // SEND OTP

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(MobileNumber)) {
      setError("Enter valid 10-digit mobile number");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await axiosClient.post("/otp/send", {
        MobileNumber,
      });

      setStep("OTP");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };
  // VERIFY OTP
  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await axiosClient.post("/otp/verify", {
        MobileNumber,
        otp,
      });

      localStorage.setItem("userID", MobileNumber);
      localStorage.setItem("userName", "User");
      localStorage.setItem("loginType", "OTP");

      window.dispatchEvent(new Event("user-login"));
      window.dispatchEvent(new Event("storage"));

      onClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-popup">

        {/* CLOSE */}
        <button className="close-btn" onClick={onClose}>×</button>

        {/* LEFT IMAGE */}
        <div className="login-image">
          <img src={moviingTeam} alt="Moving Service" />
        </div>

        {/* RIGHT CONTENT */}
        <div className="login-content">
          <h3>Let’s get your move started 🚚</h3>
          <p className="login-subtitle">
            We never share your number or send spam.
          </p>

          {/* ================= MOBILE STEP ================= */}
          {step === "MOBILE" && (
            <>
              <div className="form-group phone-input">
                <span className="country-code">🇮🇳 +91</span>
                <input
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={MobileNumber}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button
                className="login-btn"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Verify & Continue"}
              </button>

              <div className="trust-row">✔ No spam • 100% secure</div>
              <div className="rating-row">
                ⭐ 4.8/5 | 15+ Years Experience
              </div>
              <div  className="rating-row">
                🛡️ Damage Protection • Verified Professionals
              </div>
              <div  className="rating-row">
                📍 Serving 10+ Cities Across India
              </div>
            </>
          )}

          {/* ================= OTP STEP ================= */}
          {step === "OTP" && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  className="otp-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button
                className="login-btn"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="resend-otp" onClick={sendOtp}>
                Resend OTP
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default UserLogin;
