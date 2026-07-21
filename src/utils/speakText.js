export const speakText = (text, langCode = "en") => {
  const utterance = new SpeechSynthesisUtterance(text);

  const langMap = {
    en: "en-US",
    hi: "hi-IN",
    kn: "kn-IN",
    te: "te-IN",
    ta: "ta-IN",
    ml: "ml-IN",
    bn: "bn-IN",
    gu: "gu-IN",
    mr: "mr-IN",
    ur: "ur-PK"
  };

  utterance.lang = langMap[langCode] || "en-US";
  window.speechSynthesis.speak(utterance);
};
