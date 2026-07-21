"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MicIcon from "@mui/icons-material/Mic";

export default function VoiceAssistant({ onText }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = ""; // 🌍 Auto detect language
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onText(transcript); // send text to parent
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <motion.button
      onClick={startListening}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: "52px",
        height: "52px",
        borderRadius: "15px",
        border: "none",
        background: listening
          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
      }}
    >
      <MicIcon />
    </motion.button>
  );
}
