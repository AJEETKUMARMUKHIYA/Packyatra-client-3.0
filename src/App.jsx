// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Public pages
import Home from "./pages/Home.jsx";
import Modal from "./pages/Model.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import PaymentSummary from "./pages/PaymentSummary.jsx";
import PaymentGateway from "./pages/PaymentGateway.jsx";
import PaymentCallback from "./pages/PaymentCallback.jsx";
import Step5_Confirmation from "./pages/Step5_Confirmation.jsx";
import  ScrollToTop from './components/ScrollToTop.jsx'
// Static pages
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import RefundPolicy from "./pages/Refaundpolicy.jsx";
import PravacyPolicies from "./pages/Privacypolicy.jsx";


import UserProfile from './components/UserProfile';
import "./App.css";
import HomeAdmin from "./pages/HomeAdmin.jsx";
import ModalAdmin from "./pages/ModelAdmin.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userID")
  );

  const handleLoginStatusChange = (status) => {
    setIsLoggedIn(status);
  };

  return (
    <Router>
      <ScrollToTop /> 
      <div className="page-container">
        {/* Header always visible */}
        <Header onLoginStatusChange={handleLoginStatusChange} />

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* ✅ Only This Route Is Protected */}
            <Route
                 path="/ticket-booking"
                 element={
                 <ProtectedRoute>
                   <HomeAdmin />
                 </ProtectedRoute>
                }
            />

            {/* Modal / Price Summary */}
            <Route path="/price-summary" element={<Modal onLoginStatusChange={handleLoginStatusChange} />} />

            {/* Booking Flow */}
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/payment-summary" element={<PaymentSummary />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            <Route path="/profile" element={<UserProfile />} /> 
            <Route path="/bookings" element={<UserProfile />} />
            {/* ✅ PhonePe Callback */}
            <Route path="/payment/callback" element={<PaymentCallback />} />

            {/* ✅ Final Confirmation */}
            <Route path="/booking/step5_confirmation" element={<Step5_Confirmation />} />

            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy-policy" element={<PravacyPolicies />} />

          </Routes>
        </main>

        {/* Footer always visible */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
