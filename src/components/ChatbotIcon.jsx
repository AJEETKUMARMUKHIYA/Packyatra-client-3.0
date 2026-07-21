import React, { useState } from "react";

/* ============================
   PACKYATRA PY SVG ICON
============================ */
const PackyatraChatIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
      zIndex: 2
    }}
  >
    <circle cx="32" cy="32" r="32" fill="#2563eb" />
    <text
      x="50%"
      y="54%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="30"
      fontWeight="900"
      fill="#ffffff"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      PY
    </text>
  </svg>
);

/* ============================
   CHATBOT FLOATING BUTTON
============================ */
const ChatbotIcon = ({ onClick, isOpen }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      aria-label="Open PackYatra Chat"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "68px",
        height: "68px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2563eb, #38bdf8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 12px 28px rgba(37,99,235,0.45)",
        border: "3px solid #38bdf8",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
      }}
    >
      {/* Light shine */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 70%)"
        }}
      />

      {/* ICON LOGIC */}
      {isOpen ? (
        <span
          style={{
            fontSize: "32px",
            fontWeight: "900",
            color: "#fff",
            zIndex: 2,
            transition: "transform 0.3s"
          }}
        >
          ×
        </span>
      ) : hover ? (
        <span
          style={{
            fontSize: "34px",
            zIndex: 0,
            transition: "transform 0.3s"
          }}
        >
          🤖
        </span>
      ) : (
        <PackyatraChatIcon />
      )}

      {/* Notification Dot */}
      {!isOpen && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#ff3b3b",
            border: "2px solid #fff",
            zIndex: 3
          }}
        />
      )}
    </div>
  );
};

export default ChatbotIcon;