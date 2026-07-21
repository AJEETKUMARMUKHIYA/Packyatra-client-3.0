import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Modal from "./pages/Model";
import Home from "./pages/Home";
import PaymentSummary from "./pages/PaymentSummary";
import PaymentGateway from "./pages/PaymentGateway";
import BookingPage from "./pages/BookingPage";
import ManageUserPage from "./admin/Users/ManageUserPage";
import SupervisorPage from "./admin/Users/SupervisorPage1";
import UpdateTicket from "./admin/Users/UpdateTicket";
import "./App.css";
const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("userID")
  );


  const modalProps = {
    distance: 0,
    activeTab: "tab1",
    shiftingDate: new Date().toISOString(),
    fromAddress: "Default From",
    toAddress: "Default To",
  };

  const handleLoginStatusChange = (status: boolean) => {
    setIsLoggedIn(status);
  };

  return (
    <Router>
      <div className="page-container">
        <Header onLoginStatusChange={handleLoginStatusChange} />
        <main className="main-content">
          <Routes>
             <Route path="/" element={<Home openModal={() => setIsModalOpen(true)} />} /> 
            <Route path="/booking" element={<BookingPage />} />
             <Route path="/payment-summary" element={<PaymentSummary />} /> 
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            <Route path="/manageUserPage" element={<ManageUserPage />} />
            <Route path="/supervisorPage/:userId" element={<SupervisorPage />} />
            <Route path="/admin/users/updateticket/:ticketId" element={<UpdateTicket />} />
          </Routes>
        </main>

        <Modal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          {...modalProps}
          onLoginStatusChange={handleLoginStatusChange}
        />

        <Footer />
      </div>
    </Router>
  );
};
export default App;

