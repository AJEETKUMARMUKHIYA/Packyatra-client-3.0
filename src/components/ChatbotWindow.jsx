import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faMinus,
  faPaperPlane,
  faRobot,
  faUser,
  faMicrophone,
  faVolumeUp,
  faVolumeMute,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { speakText } from "../utils/speakText";

/* ==========================================================================
   SUPPORTED LANGUAGES CONFIG
   ========================================================================== */
const languages = [
  { code: "en", name: "English", label: "EN", flag: "🇬🇧" },
  { code: "hi", name: "हिन्दी", label: "HI", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ", label: "KN", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", label: "TA", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", label: "TE", flag: "🇮🇳" },
  { code: "ml", name: "മലയാളം", label: "ML", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", label: "BN", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", label: "MR", flag: "🇮🇳" }
];

/* ==========================================================================
   MULTILINGUAL DICTIONARY & KNOWLEDGE BASE
   ========================================================================== */
const translations = {
  en: {
    greeting: "Namaste! Welcome to PackYatra. I am your automated relocation assistant. How can I help you today?",
    placeholder: "Ask something about your shifting...",
    typing: "PackYatra Assistant is typing...",
    online: "Online & Ready",
    title: "PackYatra Assistant",
    send: "Send",
    quickReplies: [
      { label: "📦 Get a Quote", value: "How do I get a price quotation?" },
      { label: "🚚 Track Shipment", value: "How can I track my shipment?" },
      { label: "🛡️ Is Insurance Included?", value: "Do you provide transit insurance?" },
      { label: "📞 Contact Support", value: "How do I contact PackYatra support?" }
    ],
    responses: {
      quote: "To get a quick price quotation, please use our 'Price Calculator' on the home page or click on the 'Get Quote' button in the navigation bar. You will select your city, moving details, items list, and get an instant cost estimation!",
      track: "You can track your active shipment by navigating to the 'Track Shipment' page or your Profile Dashboard. Simply log in with your OTP, and you'll find your booked order details, active status, and real-time supervisor updates.",
      insurance: "Yes! PackYatra offers premium, comprehensive transit insurance of up to 100% value protection for your household goods. Our packing team uses multi-layer bubble wrapping and heavy-duty corrugated sheets to ensure absolute safety during transit.",
      contact: "You can contact our support team at customercare@packyatra.com or call us directly at +91 90715 35535. We are available 24/7 to assist with your relocation needs!",
      locations: "We serve all major metro cities across India, including Bangalore, Mumbai, Chennai, Pune, Hyderabad, Delhi NCR, and Kolkata, as well as inter-city relocations between them.",
      fallback: "Thank you for reaching out! For precise queries regarding your booking, price calculations, or customized requirements, you can also connect with our customer success desk directly using our contact details in the footer."
    }
  },
  hi: {
    greeting: "नमस्ते! पैकयात्रा में आपका स्वागत है। मैं आपका स्वचालित स्थानांतरण सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    placeholder: "स्थानांतरण के बारे में कुछ पूछें...",
    typing: "पैकयात्रा सहायक लिख रहा है...",
    online: "ऑनलाइन और तैयार",
    title: "पैकयात्रा सहायक",
    send: "भेजें",
    quickReplies: [
      { label: "📦 कोटेशन प्राप्त करें", value: "मैं मूल्य कोटेशन कैसे प्राप्त करूं?" },
      { label: "🚚 शिपमेंट ट्रैक करें", value: "मैं अपना शिपमेंट कैसे ट्रैक कर सकता हूँ?" },
      { label: "🛡️ क्या बीमा शामिल है?", value: "क्या आप पारगमन बीमा प्रदान करते हैं?" },
      { label: "📞 सहायता से संपर्क करें", value: "मैं पैकयात्रा सहायता से कैसे संपर्क करूं?" }
    ],
    responses: {
      quote: "त्वरित मूल्य कोटेशन प्राप्त करने के लिए, कृपया होम पेज पर हमारे 'मूल्य कैलकुलेटर' का उपयोग करें या नेविगेशन बार में 'गेट कोट' बटन पर क्लिक करें। आप अपने शहर, स्थानांतरण विवरण, सामानों की सूची का चयन करेंगे, और तत्काल लागत अनुमान प्राप्त करेंगे!",
      track: "आप 'ट्रैक शिपमेंट' पेज या अपने प्रोफाइल डैशबोर्ड पर जाकर अपने सक्रिय शिपमेंट को ट्रैक कर सकते हैं। बस अपने ओटीपी के साथ लॉग इन करें, और आपको अपने बुक किए गए ऑर्डर का विवरण, सक्रिय स्थिति और वास्तविक समय में सुपरवाइजर अपडेट मिल जाएंगे।",
      insurance: "हाँ! पैकयात्रा आपके घरेलू सामानों के लिए 100% मूल्य संरक्षण तक का प्रीमियम, व्यापक पारगमन बीमा प्रदान करती है। हमारी पैकिंग टीम पारगमन के दौरान पूर्ण सुरक्षा सुनिश्चित करने के लिए मल्टी-लेयर बबल रैपिंग और भारी-भरकम नालीदार चादरों का उपयोग करती है।",
      contact: "आप हमारी सहायता टीम से customercare@packyatra.com पर संपर्क कर सकते हैं या हमें सीधे +91 90715 35535 पर कॉल कर सकते हैं। हम आपकी स्थानांतरण आवश्यकताओं में सहायता के लिए 24/7 उपलब्ध हैं!",
      locations: "हम बैंगलोर, मुंबई, चेन्नई, पुणे, हैदराबाद, दिल्ली एनसीआर और कोलकाता सहित पूरे भारत के सभी प्रमुख मेट्रो शहरों में सेवा प्रदान करते हैं, साथ ही उनके बीच अंतर-शहरी स्थानांतरण भी करते हैं।",
      fallback: "सम्पर्क करने के लिए धन्यवाद! आपकी बुकिंग, मूल्य गणना, या अनुकूलित आवश्यकताओं के बारे में सटीक प्रश्नों के लिए, आप फुटर में हमारे संपर्क विवरणों का उपयोग करके सीधे हमारे ग्राहक सफलता डेस्क से भी जुड़ सकते हैं।"
    }
  },
  kn: {
    greeting: "ನಮಸ್ತೆ! ಪ್ಯಾಕ್‌ಯಾತ್ರೆಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ ಸ್ವಯಂಚಾಲಿತ ಸ್ಥಳಾಂತರ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    placeholder: "ಸ್ಥಳಾಂತರದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...",
    typing: "ಅಸಿಸ್ಟೆಂಟ್ ಟೈಪ್ ಮಾಡುತ್ತಿದ್ದಾರೆ...",
    online: "ಆನ್‌ಲೈನ್ ಮತ್ತು ಸಿದ್ಧವಾಗಿದೆ",
    title: "ಪ್ಯಾಕ್‌ಯಾತ್ರೆ ಸಹಾಯಕ",
    send: "ಕಳುಹಿಸಿ",
    quickReplies: [
      { label: "📦 ಉದ್ಧರಣ ಪಡೆಯಿರಿ", value: "ನಾನು ಬೆಲೆ ಉದ್ಧರಣವನ್ನು ಹೇಗೆ ಪಡೆಯುವುದು?" },
      { label: "🚚 ಶಿಪ್‌ಮೆಂಟ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", value: "ನನ್ನ ಶಿಪ್‌ಮೆಂಟ್ ಅನ್ನು ನಾನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು?" },
      { label: "🛡️ ವಿಮೆ ಸೇರಿಸಲಾಗಿದೆಯೇ?", value: "ನೀವು ಸಾರಿಗೆ ವಿಮೆಯನ್ನು ಒದಗಿಸುತ್ತೀರಾ?" },
      { label: "📞 ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ", value: "ಪ್ಯಾಕ್‌ಯಾತ್ರೆ ಬೆಂಬಲವನ್ನು ನಾನು ಹೇಗೆ ಸಂಪರ್ಕಿಸುವುದು?" }
    ],
    responses: {
      quote: "ಕೋಟ್‌ ಪಡೆಯಲು, ದಯವಿಟ್ಟು ಮುಖಪುಟದಲ್ಲಿ ನಮ್ಮ 'ಬೆಲೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್' ಅನ್ನು ಬಳಸಿ ಅಥವಾ ನ್ಯಾವಿಗೇಷನ್ ಬಾರ್‌ನಲ್ಲಿರುವ 'ಗೆಟ್ ಕೋಟ್' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ನಿಮ್ಮ ನಗರ, ಸ್ಥಳಾಂತರದ ವಿವರಗಳು, ಐಟಂಗಳ ಪಟ್ಟಿಯನ್ನು ನೀವು ಆರಿಸಿಕೊಳ್ಳುತ್ತೀರಿ ಮತ್ತು ತ್ವರಿತ ವೆಚ್ಚದ ಅಂದಾಜು ಪಡೆಯುತ್ತೀರಿ!",
      track: "ಟ್ರ್ಯಾಕ್ ಶಿಪ್‌ಮೆಂಟ್ ಪುಟ ಅಥವಾ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗುವ ಮೂಲಕ ನಿಮ್ಮ ಸಕ್ರಿಯ ಶಿಪ್‌ಮೆಂಟ್ ಅನ್ನು ನೀವು ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು. ನಿಮ್ಮ ಒಟಿಪಿಯೊಂದಿಗೆ ಸರಳವಾಗಿ ಲಾಗ್ ಇನ್ ಮಾಡಿ, ಮತ್ತು ನಿಮ್ಮ ಬುಕ್ ಮಾಡಿದ ಆರ್ಡರ್ ವಿವರಗಳು, ಸಕ್ರಿಯ ಸ್ಥಿತಿ ಮತ್ತು ನೈಜ-ಸಮಯದ ಮೇಲ್ವಿಚಾರಕರ ನವೀಕರಣಗಳನ್ನು ನೀವು ಕಾಣಬಹುದು.",
      insurance: "ಹೌದು! ಪ್ಯಾಕ್‌ಯಾತ್ರೆ ನಿಮ್ಮ ಗೃಹೋಪಯೋಗಿ ವಸ್ತುಗಳಿಗೆ 100% ಮೌಲ್ಯದ ರಕ್ಷಣೆಯವರೆಗೆ ಪ್ರೀಮಿಯಂ, ಸಮಗ್ರ ಸಾರಿಗೆ ವಿಮೆಯನ್ನು ನೀಡುತ್ತದೆ. ಸಾರಿಗೆ ಸಮಯದಲ್ಲಿ ಸಂಪೂರ್ಣ ಸುರಕ್ಷತೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ನಮ್ಮ ಪ್ಯಾಕಿಂಗ್ ತಂಡವು ಬಹು-ಪದರದ ಬಬಲ್ ಸುತ್ತುವಿಕೆ ಮತ್ತು ಹೆವಿ ಡ್ಯೂಟಿ ಕಾರ್ಡ್‌ಬೋರ್ಡ್ ಶೀಟ್‌ಗಳನ್ನು ಬಳಸುತ್ತದೆ.",
      contact: "ನೀವು ನಮ್ಮ ಬೆಂಬಲ ತಂಡವನ್ನು customercare@packyatra.com ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಬಹುದು ಅಥವಾ +91 90715 35535 ಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಬಹುದು. ನಿಮ್ಮ ಸ್ಥಳಾಂತರದ ಅಗತ್ಯತೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಾವು 24/7 ಲಭ್ಯವಿದ್ದೇವೆ!",
      locations: "ನಾವು ಬೆಂಗಳೂರು, ಮುಂಬೈ, ಚೆನ್ನೈ, ಪುಣೆ, ಹೈದರಾಬಾದ್, ದೆಹಲಿ ಎನ್‌ಸಿಆರ್ ಮತ್ತು ಕೋಲ್ಕತ್ತಾ ಸೇರಿದಂತೆ ಭಾರತದಾದ್ಯಂತ ಎಲ್ಲಾ ಪ್ರಮುಖ ಮೆಟ್ರೋ ನಗರಗಳಲ್ಲಿ ಸೇವೆ ಸಲ್ಲಿಸುತ್ತೇವೆ, ಜೊತೆಗೆ ಅವುಗಳ ನಡುವೆ ಅಂತರ-ನಗರಿ ಸ್ಥಳಾಂತರಗಳನ್ನು ಒದಗಿಸುತ್ತೇವೆ.",
      fallback: "ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಬುಕಿಂಗ್, ಬೆಲೆ ಲೆಕ್ಕಾಚಾರಗಳು ಅಥವಾ ಕಸ್ಟಮೈಸ್ ಮಾಡಿದ ಅವಶ್ಯಕತೆಗಳ ಬಗ್ಗೆ ನಿಖರವಾದ ಪ್ರಶ್ನೆಗಳಿಗಾಗಿ, ನೀವು ಫುಟರ್‌ನಲ್ಲಿರುವ ನಮ್ಮ ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಬಳಸಿಕೊಂಡು ನೇರವಾಗಿ ನಮ್ಮ ಗ್ರಾಹಕ ಯಶಸ್ಸಿನ ಡೆಸ್ಕ್‌ನೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಬಹುದು."
    }
  },
  te: {
    greeting: "నమస్తే! ప్యాక్‌యాత్రా అసిస్టెంట్ మీకు స్వాగతం పలుకుతోంది. నేను మీ ఆటోమేటెడ్ రిలోకేషన్ అసిస్టెంట్. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
    placeholder: "రిలోకేషన్ గురించి ఏదైనా అడగండి...",
    typing: "ప్యాక్‌యాత్ర అసిస్టెంట్ టైప్ చేస్తోంది...",
    online: "ఆన్‌లైన్ & సిద్ధం",
    title: "ప్యాక్‌యాత్ర అసిస్టెంట్",
    send: "పంపండి",
    quickReplies: [
      { label: "📦 కొటేషన్ పొందండి", value: "ధర కొటేషన్ ఎలా పొందాలి?" },
      { label: "🚚 షిప్‌మెంట్ ట్రాక్ చేయండి", value: "నా షిప్‌మెంట్‌ను ఎలా ట్రాక్ చేయాలి?" },
      { label: "🛡️ ఇన్సూరెన్స్ ఉందా?", value: "మీరు రవాణా బీమా అందిస్తారా?" },
      { label: "📞 మద్దతును సంప్రదించండి", value: "ప్యాక్‌యాత్ర మద్దతును ఎలా సంప్రదించాలి?" }
    ],
    responses: {
      quote: "శీఘ్ర ధర కొటేషన్ పొందడానికి, దయచేసి హోమ్ పేజీలో మా 'ధర కాలిక్యులేటర్'ని ఉపయోగించండి లేదా నావిగేషన్ బార్‌లోని 'గెట్ కోట్' బటన్‌ను క్లిక్ చేయండి. మీరు మీ నగరం, రిలోకేషన్ వివరాలు, వస్తువుల జాబితాను ఎంచుకుంటారు మరియు తక్షణ ఖర్చు అంచనాను పొందుతారు!",
      track: "మీరు 'ట్రాక్ షిప్‌మెంట్' పేజీ లేదా మీ ప్రొఫైల్ డాష్‌బోర్డ్‌కి నావిగేట్ చేయడం ద్వారా మీ క్రియాశీల షిప్‌మెంట్‌ను ట్రాక్ చేయవచ్చు. మీ OTPతో లాగిన్ అవ్వండి, మరియు మీరు బుక్ చేసిన ఆర్డర్ వివరాలు, క్రియాశీల స్థితి మరియు నిజ-సమయ సూపర్‌వైజర్ అప్‌డేట్‌లను కనుగొంటారు.",
      insurance: "అవును! ప్యాక్‌యాత్ర మీ గృహోపకరణ వస్తువులకు 100% విలువ రక్షణ వరకు ప్రీమియం, సమగ్ర రవాణా బీమాను అందిస్తుంది. రవాణా సమయంలో పూర్తి భద్రతను నిర్ధారించడానికి మా ప్యాకింగ్ బృందం మల్టీ-లేయర్ బబుల్ ర్యాపింగ్ మరియు హెవీ డ్యూటీ కార్డ్ బోర్డ్ షీట్లను ఉపయోగిస్తుంది.",
      contact: "మీరు మా మద్దతు బృందాన్ని customercare@packyatra.comలో సంప్రదించవచ్చు లేదా నేరుగా +91 90715 35535కి కాల్ చేయవచ్చు. మీ రిలోకేషన్ అవసరాలకు సహాయం చేయడానికి మేము 24/7 అందుబాటులో ఉన్నాము!",
      locations: "మేము బెంగళూరు, ముంబై, చెన్నై, పూణే, హైదరాబాద్, ఢిల్లీ NCR మరియు కోల్‌కతా సహా భారతదేశంలోని అన్ని ప్రధాన మెట్రో నగరాలలో సేవలను అందిస్తాము, అలాగే వాటి మధ్య అంతర్-నగర రిలోకేషన్లను కూడా నిర్వహిస్తాము.",
      fallback: "సంప్రదించినందుకు ధన్యవాదాలు! మీ బుకింగ్, ధర లెక్కాచారం లేదా అనుకూలీకరించిన అవసరాల గురించి ఖచ్చితమైన సందేహాల కోసం, మీరు ఫుటర్‌లోని మా సంప్రదింపు వివరాలను ఉపయోగించి నేరుగా మా కస్టమర్ సక్సెస్ డెస్క్‌తో కనెక్ట్ అవ్వవచ్చు."
    }
  },
  ta: {
    greeting: "வணக்கம்! பேக்யாத்ராவிற்கு உங்களை வரவேற்கிறோம். நான் உங்கள் தானியங்கி இடமாற்ற உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    placeholder: "இடமாற்றம் பற்றி எதாவது கேளுங்கள்...",
    typing: "பேக்யாத்ரா உதவியாளர் தட்டச்சு செய்கிறார்...",
    online: "ஆன்லைனில் தயார்",
    title: "பேக்யாத்ரா உதவியாளர்",
    send: "அனுப்பு",
    quickReplies: [
      { label: "📦 மேற்கோள் பெறுக", value: "நான் விலை மேற்கோளை எப்படி பெறுவது?" },
      { label: "🚚 ஷிப்மென்ட் டிராக் செய்க", value: "என் ஷிப்மென்ட்டை எப்படி கண்காணிப்பது?" },
      { label: "🛡️ காப்பீடு உள்ளதா?", value: "நீங்கள் போக்குவரத்து காப்பீடு வழங்குகிறீர்களா?" },
      { label: "📞 ஆதரவை தொடர்பு கொள்ளவும்", value: "பேக்யாத்ரா ஆதரவை எப்படி தொடர்பு கொள்வது?" }
    ],
    responses: {
      quote: "விலை மேற்கோளைப் பெற, முகப்புப் பக்கத்தில் உள்ள எங்கள் 'விலை கால்குலேட்டரை' பயன்படுத்தவும் அல்லது வழிசெலுத்தல் பட்டியில் உள்ள 'மேற்கோள் பெறுக' பொத்தானைக் கிளிக் செய்யவும். உங்கள் நகரம், நகரும் விவரங்கள், பொருட்கள் பட்டியலை நீங்கள் தேர்ந்தெடுப்பீர்கள், மேலும் உடனடி செலவு மதிப்பீட்டைப் பெறுவீர்கள்!",
      track: "செயலில் உள்ள உங்கள் ஷிப்மென்ட்டை 'டிராக் ஷிப்மென்ட்' பக்கத்திற்குச் செல்வதன் மூலம் அல்லது உங்கள் சுயவிவர டாஷ்போர்டு மூலம் கண்காணிக்கலாம். உங்கள் OTP மூலம் உள்நுழைந்தால், உங்கள் முன்பதிவு செய்யப்பட்ட ஆர்டர் விவரங்கள், செயலில் உள்ள நிலை மற்றும் நிகழ்நேர மேற்பார்வையாளர் அறிவிப்புகள் ஆகியவற்றைக் கண்டறியலாம்.",
      insurance: "ஆம்! பேக்யாத்ரா உங்கள் வீட்டுப் பொருட்களுக்கு 100% மதிப்புப் பாதுகாப்பு வரையிலான பிரீமியம், விரிவான போக்குவரத்து காப்பீட்டை வழங்குகிறது. போக்குவரத்தின் போது முழுமையான பாதுகாப்பை உறுதிசெய்ய எங்கள் பேக்கிங் குழு பல அடுக்கு குமிழி மடக்குதல் மற்றும் கனரக அட்டைத் தாள்களைப் பயன்படுத்துகிறது.",
      contact: "எங்கள் ஆதரவுக் குழுவை customercare@packyatra.com என்ற மின்னஞ்சல் முகவரியில் தொடர்புகொள்ளலாம் அல்லது +91 90715 35535 என்ற எண்ணிற்கு நேரடியாக அழைக்கலாம். உங்கள் இடமாற்றத் தேவைகளுக்கு உதவ நாங்கள் 24/7 தயாராக உள்ளோம்!",
      locations: "பெங்களூர், மும்பை, சென்னை, புனே, ஹைதராபாத், டெல்லி என்சிஆர் மற்றும் கொல்கத்தா உட்பட இந்தியாவின் அனைத்து முக்கிய பெருநகரங்களிலும் நாங்கள் சேவை செய்கிறோம், அதே போல் அவற்றுக்கிடையேயான நகரங்களுக்கு இடையேயான இடமாற்றங்களையும் செய்கிறோம்.",
      fallback: "தொடர்பு கொண்டதற்கு நன்றி! உங்கள் முன்பதிவு, விலை கணக்கீடுகள் அல்லது தனிப்பயனாக்கப்பட்ட தேவைகள் பற்றிய துல்லியமான கேள்விகளுக்கு, அடிக்குறிப்பில் உள்ள எங்கள் தொடர்பு விவரங்களைப் பயன்படுத்தி எங்கள் வாடிக்கையாளர் வெற்றிப் பிரிவை நேரடியாகத் தொடர்பு கொள்ளலாம்."
    }
  },
  ml: {
    greeting: "നമസ്തേ! പാക്ക്യാത്രയിലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളുടെ ഓട്ടോമേറ്റഡ് റീലൊക്കേഷൻ അസിസ്റ്റന്റ് ആണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    placeholder: "സ്ഥലംമാറ്റത്തെക്കുറിച്ച് ചോദിക്കൂ...",
    typing: "പാക്ക്യാത്ര അസിസ്റ്റന്റ് ടൈപ്പ് ചെയ്യുന്നു...",
    online: "ഓൺലൈൻ & ലഭ്യമാണ്",
    title: "പാക്ക്യാത്ര അസിസ്റ്റന്റ്",
    send: "അയക്കുക",
    quickReplies: [
      { label: "📦 കൊട്ടേഷൻ ലഭിക്കുക", value: "ഞാൻ എങ്ങനെയാണ് കൊട്ടേഷൻ ലഭിക്കുക?" },
      { label: "🚚 ഷിപ്പ്മെന്റ് ട്രാക്ക് ചെയ്യുക", value: "എന്റെ ഷിപ്പ്മെന്റ് എങ്ങനെ ട്രാക്ക് ചെയ്യാം?" },
      { label: "🛡️ ഇൻഷുറൻസ് ഉൾപ്പെടുന്നുണ്ടോ?", value: "നിങ്ങൾ ട്രാൻസിറ്റ് ഇൻഷുറൻസ് നൽകുന്നുണ്ടോ?" },
      { label: "📞 സഹായം ബന്ധപ്പെടുക", value: "പാക്ക്യാത്ര സഹായം എങ്ങനെ ബന്ധപ്പെടാം?" }
    ],
    responses: {
      quote: "പെട്ടെന്നുള്ള വില കൊട്ടേഷൻ ലഭിക്കുന്നതിന്, ദയവായി ഹോം പേജിലെ ഞങ്ങളുടെ 'വില കാൽക്കുലേറ്റർ' ഉപയോഗിക്കുക അല്ലെങ്കിൽ നാവിഗേഷൻ ബാറിലെ 'ഗെറ്റ് കൊട്ടേഷൻ' ബട്ടണിൽ ക്ലിക്ക് ചെയ്യുക. നിങ്ങളുടെ നഗരം, മാറ്റുന്ന വിവരങ്ങൾ, സാധനങ്ങളുടെ ലിസ്റ്റ് എന്നിവ തിരഞ്ഞെടുത്ത് തൽക്ഷണ ചെലവ് കണക്കാക്കാം!",
      track: "'ട്രാക്ക് ഷിപ്പ്മെന്റ്' പേജിലേക്കോ നിങ്ങളുടെ പ്രൊഫൈൽ ഡാഷ്‌ബോർഡിലേക്കോ നാവിഗേറ്റ് ചെയ്ത് നിങ്ങളുടെ സജീവ ഷിപ്പ്മെന്റ് ട്രാക്ക് ചെയ്യാം. നിങ്ങളുടെ ഒടിപി ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക, നിങ്ങളുടെ ബുക്ക് ചെയ്ത ഓർഡർ വിവരങ്ങൾ, സജീവ നില, തത്സമയ സൂപ്പർവൈസർ അപ്‌ഡേറ്റുകൾ എന്നിവ കാണാം.",
      insurance: "അതെ! പാക്ക്യാത്ര നിങ്ങളുടെ ഗൃഹോപകരണങ്ങൾക്ക് 100% സംരക്ഷണം വരെയുള്ള പ്രീമിയം ട്രാൻസിറ്റ് ഇൻഷുറൻസ് വാഗ്ദാനം ചെയ്യുന്നു. ട്രാൻസിറ്റ് സമയത്ത് പൂർണ്ണ സുരക്ഷ ഉറപ്പാക്കാൻ ഞങ്ങളുടെ പാക്കിംഗ് ടീം മൾട്ടി-ലെയർ ബബിൾ റാപ്പിംഗും ഹെവി-ഡ്യൂട്ടി കാർഡ്ബോർഡ് ഷീറ്റുകളും ഉപയോഗിക്കുന്നു.",
      contact: "നിങ്ങൾക്ക് ഞങ്ങളുടെ സഹായ ടീമിനെ customercare@packyatra.com ൽ ബന്ധപ്പെടാം അല്ലെങ്കിൽ +91 90715 35535 എന്ന നമ്പറിൽ നേരിട്ട് വിളിക്കാം. നിങ്ങളുടെ സ്ഥലംമാറ്റ ആവശ്യങ്ങൾക്ക് സഹായിക്കാൻ ഞങ്ങൾ 24/7 ലഭ്യമാണ്!",
      locations: "ബംഗളൂരു, മുംബൈ, ചെന്നൈ, പൂനെ, ഹൈദരാബാദ്, ഡൽഹി എൻസിആർ, കൊൽക്കത്ത എന്നിവയുൾപ്പെടെ ഇന്ത്യയിലുടനീളമുള്ള എല്ലാ പ്രധാന മെട്രോ നഗരങ്ങളിലും ഞങ്ങൾ സേവനം നൽകുന്നു, കൂടാതെ അവ തമ്മിലുള്ള അന്തർ-നഗര മാറ്റങ്ങളും ഞങ്ങൾ ചെയ്യുന്നു.",
      fallback: "ബന്ധപ്പെട്ടതിന് നന്ദി! നിങ്ങളുടെ ബുക്കിംഗ്, വില കണക്കാക്കൽ അല്ലെങ്കിൽ വ്യക്തിഗതമാക്കിയ ആവശ്യങ്ങൾ എന്നിവയെക്കുറിച്ചുള്ള കൃത്യമായ ചോദ്യങ്ങൾക്ക്, അടിക്കുറിപ്പിലെ ഞങ്ങളുടെ കോൺടാക്റ്റ് വിശദാംശങ്ങൾ ഉപയോഗിച്ച് നിങ്ങൾക്ക് ഞങ്ങളുടെ ഉപഭോക്തൃ വിജയ ഡെസ്ക്കുമായി നേരിട്ട് ബന്ധപ്പെടാം."
    }
  },
  bn: {
    greeting: "নমস্তে! প্যাকযাত্রায় আপনাকে স্বাগত জানাই। আমি আপনার স্বয়ংক্রিয় স্থানান্তর সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
    placeholder: "স্থানান্তর সম্পর্কে জিজ্ঞাসা করুন...",
    typing: "প্যাকযাত্রা সহকারী টাইপ করছে...",
    online: "অনলাইন এবং প্রস্তুত",
    title: "প্যাকযাত্রা সহকারী",
    send: "পাঠান",
    quickReplies: [
      { label: "📦 কোটেশন পান", value: "আমি কীভাবে কোটেশন পেতে পারি?" },
      { label: "🚚 শিপমেন্ট ট্র্যাক করুন", value: "আমি কীভাবে আমার শিপমেন্ট ট্র্যাক করব?" },
      { label: "🛡️ ইন্স্যুরেন্স কি অন্তর্ভুক্ত?", value: "আপনারা কি ট্রানজিট ইন্স্যুরেন্স দেন?" },
      { label: "📞 সহায়তা যোগাযোগ করুন", value: "প্যাকযাত্রা সহায়তায় কীভাবে যোগাযোগ করব?" }
    ],
    responses: {
      quote: "একটি দ্রুত मूल्य উদ্ধৃতি পেতে, দয়া করে হোম পেজে আমাদের 'মূল্য ক্যালকুলেটর' ব্যবহার করুন বা নেভিগেশন বারের 'গেট কোট' বোতামে ক্লিক করুন। আপনি আপনার শহর, স্থানান্তরের বিবরণ, জিনিসপত্রের তালিকা নির্বাচন করবেন এবং একটি তাত্ক্ষণিক খরচ অনুমান পাবেন!",
      track: "আপনি 'ট্র্যাক শিপমেন্ট' পৃষ্ঠা বা আপনার প্রোফাইল ড্যাশবোর্ডে গিয়ে আপনার সক্রিয় শিপমেন্ট ট্র্যাক করতে পারেন। কেবল আপনার ওটিপি দিয়ে লগইন করুন, এবং আপনি আপনার বুক করা অর্ডারের বিবরণ, সক্রিয় স্থিতি এবং রিয়েল-টাইম সুপারভাইজার আপডেট পাবেন।",
      insurance: "হ্যাঁ! প্যাকযাত্রা আপনার গৃহস্থালী সামগ্রীর জন্য ১০০% মূল্য সুরক্ষা পর্যন্ত প্রিমিয়াম, ব্যাপক ট্রানজিট ইন্স্যুরেন্স অফার করে। আমাদের প্যাকিং টিম পরিবহনের সময় সম্পূর্ণ নিরাপত্তা নিশ্চিত করতে মাল্টি-লেয়ার বাবল র‍্যাপিং এবং ভারী শুলক্ষী শিট ব্যবহার করে।",
      contact: "আপনি আমাদের সহায়তা টিমের সাথে customercare@packyatra.com এ যোগাযোগ করতে পারেন বা আমাদের সরাসরি +91 90715 35535 এ কল করতে পারেন। আমরা আপনার স্থানান্তরের প্রয়োজনে সহায়তা করার জন্য ২৪/৭ উপলব্ধ আছি!",
      locations: "আমরা ব্যাঙ্গালোর, মুম্বাই, চেন্নাই, পুনে, হায়দ্রাবাদ, দিল্লি এনসিআর এবং কলকাতা সহ ভারতের সমস্ত প্রধান মেট্রো শহরে পরিষেবা প্রদান করি, সেইসাথে তাদের মধ্যে আন্তঃ-শহরের স্থানান্তরও করি।",
      fallback: "যোগাযোগ করার लिए ধন্যবাদ! আপনার বুকিং, মূল্য গণনা বা কাস্টমাইজড প্রয়োজনীয়তা সম্পর্কে সুনির্দিষ্ট প্রশ্নের জন্য, আপনি ফুটারের আমাদের যোগাযোগের বিবরণ ব্যবহার করে সরাসরি আমাদের গ্রাহক সাফল্য ডেস্কের সাথে সংযোগ করতে পারেন।"
    }
  },
  mr: {
    greeting: "नमस्ते! पॅकयात्रा मध्ये आपले स्वागत आहे. मी आपला स्वयंचलित स्थलांतर सहाय्यक आहे. आज मी आपल्याला कशी मदत करू शकतो?",
    placeholder: "स्थलांतराबद्दल काही विचारा...",
    typing: "पॅकयात्रा सहाय्यक टाईप करत आहे...",
    online: "ऑनलाइन आणि सज्ज",
    title: "पॅकयात्रा सहाय्यक",
    send: "पाठवा",
    quickReplies: [
      { label: "📦 कोटेशन मिळवा", value: "मी कोटेशन कसे मिळवू शकतो?" },
      { label: "🚚 शिपमेंट ट्रॅक करा", value: "मी माझे शिपमेंट कसे ट्रॅक करू?" },
      { label: "🛡️ विमा समाविष्ट आहे का?", value: "आपण ट्रान्झिट विमा प्रदान करता का?" },
      { label: "📞 सपोर्टशी संपर्क साधा", value: "मी पॅकयात्रा सपोर्टशी कसा संपर्क साधू?" }
    ],
    responses: {
      quote: "त्वरित किंमत कोटेशन मिळवण्यासाठी, कृपया होम पेजवर आमच्या 'प्राईस कॅल्क्युलेटर'चा वापर करा किंवा नेव्हिगेशन बारमधील 'गेट कोट' बटणावर क्लिक करा. आपण आपले शहर, स्थलांतराचे तपशील, वस्तूंची यादी निवडू शकता आणि त्वरित खर्चाचा अंदाज मिळवू शकता!",
      track: "आपण 'ट्रॅक शिपमेंट' पेज किंवा आपल्या प्रोफाइल डॅशबोर्डवर जाऊन आपले सक्रिय शिपमेंट ट्रॅक करू शकता. फक्त आपल्या ओटीपीने लॉग इन करा, आणि आपल्याला आपले बुक केलेले ऑर्डर तपशील, सक्रिय स्थिती आणि रिअल-टाइम सुपरवायझर अपडेट्स मिळतील.",
      insurance: "होय! पॅकयात्रा आपल्या घरगुती वस्तूंसाठी १००% मूल्य संरक्षणापर्यंत प्रीमियम, व्यापक ट्रान्झिट विमा प्रदान करते. ट्रान्सपोर्ट दरम्यान पूर्ण सुरक्षा सुनिश्चित करण्यासाठी आमची पॅकिंग टीम मल्टी-लेयर बबल रॅपिंग आणि हेवी-ड्यूटी कोरुगेटेड शीट्सचा वापर करते.",
      contact: "आपण आमच्या सपोर्ट टीमशी customercare@packyatra.com वर संपर्क साधू शकता किंवा आम्हाला थेट +91 90715 35535 वर संपर्क करू शकता. आम्ही आपल्या स्थलांतराच्या गरजांसाठी २४/७ उपलब्ध आहोत!",
      locations: "आम्ही बंगलोर, मुंबई, चेन्नई, पुणे, हैदराबाद, दिल्ली एनसीआर आणि कोलकाता यांसह भारतातील सर्व प्रमुख मेट्रो शहरांमध्ये सेवा प्रदान करतो, तसेच त्यांच्या दरम्यान आंतर-शहरी स्थलांतर देखील करतो.",
      fallback: "संपर्क केल्याबद्दल धन्यवाद! आपल्या बुकिंग, किंमत गणना किंवा सानुकूलित आवश्यकतांबद्दल अचूक प्रश्नांसाठी, आपण फुटरमधील आमच्या संपर्क तपशीलाचा वापर करून थेट आमच्या ग्राहक यश डेस्कशी संपर्क साधू शकता।"
    }
  }
};

const ChatbotWindow = ({ onClose, onMinimize, isMinimized }) => {
  const [language, setLanguage] = useState("en");
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: translations.en.greeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  // Dynamic localization of the welcome greeting if it's the only message or still untouched
  useEffect(() => {
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.id === 1) {
          return {
            ...msg,
            text: translations[language].greeting
          };
        }
        return msg;
      });
    });
  }, [language]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const query = text.toLowerCase();
      let botTextKey = "fallback";

      if (
        query.includes("quote") || query.includes("price") || query.includes("calculate") || query.includes("cost") ||
        query.includes("कोटेशन") || query.includes("मूल्य") || query.includes("किंमत") ||
        query.includes("ಉದ್ಧರಣ") || query.includes("ಕೊಟೇಷನ್") || query.includes("ಬೆಲೆ") ||
        query.includes("ధర") || query.includes("కొటేషన్") || query.includes("మేற்கோள்") || query.includes("விலை") ||
        query.includes("കൊട്ടേഷൻ") || query.includes("വില") || query.includes("കോട്ടേഷൻ") || query.includes("মূল্য") || query.includes("উদ্ধৃতি")
      ) {
        botTextKey = "quote";
      } else if (
        query.includes("track") || query.includes("shipment") || query.includes("status") || query.includes("where") ||
        query.includes("ट्रैक") || query.includes("ಶಿಪ್‌ಮೆಂಟ್") || query.includes("ಟ್ರಾಕ್") || query.includes("ట్రాక్") ||
        query.includes("டிராக்") || query.includes("டிராகிங்") || query.includes("ട്രാക്ക്") || query.includes("ট্যাক") ||
        query.includes("ট্র্যাক") || query.includes("ट्रॅक")
      ) {
        botTextKey = "track";
      } else if (
        query.includes("insurance") || query.includes("damage") || query.includes("safe") || query.includes("secure") ||
        query.includes("बीमा") || query.includes("सुरक्षा") || query.includes("ವಿಮೆ") || query.includes("ಕಾப்பீடு") ||
        query.includes("భద్రత") || query.includes("ఇన్సూరెన్స్") || query.includes("ഇൻഷുറൻസ്") ||
        query.includes("ইন্স্যুরেন্স") || query.includes("विमा")
      ) {
        botTextKey = "insurance";
      } else if (
        query.includes("contact") || query.includes("support") || query.includes("phone") || query.includes("call") || query.includes("email") ||
        query.includes("संपर्क") || query.includes("सपोर्ट") || query.includes("ಕರೆ") || query.includes("ಬೆಂಬಲ") ||
        query.includes("தொலைபேசி") || query.includes("தொடர்பு") || query.includes("మద్దతు") || query.includes("సపోర్ట్") ||
        query.includes("விളിക്കുക") || query.includes("സഹായം") || query.includes("যোগাযোগ") || query.includes("सपोर्टशी")
      ) {
        botTextKey = "contact";
      } else if (
        query.includes("city") || query.includes("where do you serve") || query.includes("locations") || query.includes("serve") ||
        query.includes("शहर") || query.includes("ನಗರ") || query.includes("ನಗರಗಳಲ್ಲಿ") || query.includes("நகரங்கள்") ||
        query.includes("పట్టణం") || query.includes("పట్టణాలు") || query.includes("പട്ടണങ്ങൾ") || query.includes("শহর") || query.includes("शहर")
      ) {
        botTextKey = "locations";
      }

      const botText = translations[language].responses[botTextKey];

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: botText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // Play text-to-speech if sound is enabled
      if (isSoundEnabled) {
        speakText(botText, language);
      }
    }, 1200);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      return;
    }

    const recognition = new SpeechRecognition();

    const speechLangMap = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
      te: "te-IN",
      ta: "ta-IN",
      ml: "ml-IN",
      bn: "bn-IN",
      mr: "mr-IN"
    };

    recognition.lang = speechLangMap[language] || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  if (isMinimized) {
    return null;
  }

  const quickReplies = translations[language].quickReplies;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        right: "24px",
        width: "380px",
        height: "500px",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1001,
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
        border: "1px solid #e2e8f0"
      }}
    >
      {/* Header with Localization and Sound Controls */}
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "#ffffff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FontAwesomeIcon icon={faRobot} style={{ fontSize: "14px" }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "600", letterSpacing: "0.2px" }}>
              {translations[language].title}
            </h4>
            <span style={{ fontSize: "10px", opacity: 0.85 }}>{translations[language].online}</span>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Language selection dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: "12px",
              padding: "2px 6px"
            }}
          >
            <FontAwesomeIcon icon={faGlobe} style={{ fontSize: "11px", opacity: 0.9 }} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                outline: "none",
                padding: "2px 0",
                fontFamily: "inherit"
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} style={{ color: "#0f172a" }}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle Button (Text to Speech) */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "4px",
              opacity: isSoundEnabled ? 1 : 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s"
            }}
            title={isSoundEnabled ? "Mute Voice Responses" : "Enable Voice Responses (Speak)"}
          >
            <FontAwesomeIcon icon={isSoundEnabled ? faVolumeUp : faVolumeMute} style={{ fontSize: "13px" }} />
          </button>

          {onMinimize && (
            <button
              onClick={onMinimize}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                opacity: 0.8
              }}
              aria-label="Minimize Chat"
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "4px",
              opacity: 0.8
            }}
            aria-label="Close Chat"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: "8px"
            }}
          >
            {msg.sender === "bot" && (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  flexShrink: 0
                }}
              >
                <FontAwesomeIcon icon={faRobot} />
              </div>
            )}
            <div style={{ maxWidth: "75%" }}>
              <div
                style={{
                  backgroundColor: msg.sender === "user" ? "#2563eb" : "#ffffff",
                  color: msg.sender === "user" ? "#ffffff" : "#1e293b",
                  padding: "10px 14px",
                  borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                  border: msg.sender === "bot" ? "1px solid #e2e8f0" : "none"
                }}
              >
                {msg.text}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: "#94a3b8",
                  marginTop: "4px",
                  display: "block",
                  textAlign: msg.sender === "user" ? "right" : "left"
                }}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px"
              }}
            >
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "12px 16px",
                borderRadius: "16px 16px 16px 2px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                border: "1px solid #e2e8f0",
                display: "flex",
                gap: "4px"
              }}
            >
              <span className="bounce-dot" style={{ width: "6px", height: "6px", backgroundColor: "#94a3b8", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both" }}></span>
              <span className="bounce-dot" style={{ width: "6px", height: "6px", backgroundColor: "#94a3b8", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }}></span>
              <span className="bounce-dot" style={{ width: "6px", height: "6px", backgroundColor: "#94a3b8", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies list (shows only if last msg is bot and not typing) */}
      {messages[messages.length - 1]?.sender === "bot" && !isTyping && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#f1f5f9",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            borderTop: "1px solid #e2e8f0"
          }}
        >
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qr.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#2563eb",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#eff6ff";
                e.target.style.borderColor = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = "#cbd5e1";
              }}
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form with Inline Voice input button */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "12px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: "8px"
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={translations[language].placeholder}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "24px",
            border: "1px solid #cbd5e1",
            fontSize: "13px",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
        />

        {/* Voice Speech-to-Text Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: isListening ? "#ef4444" : "#f1f5f9",
            color: isListening ? "#ffffff" : "#475569",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: isListening ? "0 0 12px rgba(239, 68, 68, 0.4)" : "none",
            animation: isListening ? "pulse-red 1.5s infinite" : "none"
          }}
          title="Voice Search"
        >
          <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: "14px" }} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
          aria-label="Send Message"
        >
          <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "14px" }} />
        </button>
      </form>

      {/* Inline animation styles for bounce & pulse effect */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default ChatbotWindow;
