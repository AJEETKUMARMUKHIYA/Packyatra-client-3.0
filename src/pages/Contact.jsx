import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import "../styles/Contact.css";

const Contact = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Household Shifting",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please provide a valid 10-digit phone number.");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please enter your message.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Simulate real API submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "Household Shifting",
        message: ""
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Contact Header Section */}
      <section className="contact-header-section">
        <div className="contact-header-overlay" />
        <div className="contact-header-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="contact-badge-pill"
          >
            💬 Reach Our Experts
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="contact-page-title"
          >
            We're Always Ready to Help
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="contact-page-subtitle"
          >
            Get a tailored consultation or clarify your queries within minutes. Choose your channel.
          </motion.p>
        </div>
      </section>

      {/* Main Split Grid */}
      <section className="contact-split-section">
        <div className="container">
          <div className="contact-split-grid">
            
            {/* LEFT COLUMN: CONTACT DETAILS & INFO */}
            <motion.div 
              className="contact-details-col"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="contact-info-header">
                <h3>Contact Information</h3>
                <p>Reach out to us directly or visit our corporate headquarters in Bangalore.</p>
              </div>

              <div className="contact-cards-stack">
                {/* HEAD OFFICE */}
                <div className="contact-detail-box-premium">
                  <div className="box-icon-bg head-office-bg">
                    <MapPin size={22} />
                  </div>
                  <div className="box-content">
                    <h4>Head Office Address</h4>
                    <h5>Packyatra Relocations Pvt. Ltd.</h5>
                    <p className="address-text-paragraph">
                      122, 4th Main, 1st Stage, 1st Phase,<br />
                      West of Chord Road, Manjunath Nagar,<br />
                      Bangalore - 560010, Karnataka, India
                    </p>
                  </div>
                </div>

                {/* CALL US */}
                <a href="tel:+919071535535" className="contact-detail-box-premium linkable-box">
                  <div className="box-icon-bg call-bg">
                    <Phone size={22} />
                  </div>
                  <div className="box-content">
                    <h4>Call Support</h4>
                    <span className="box-highlight-value">+91 90715 35535</span>
                    <p className="box-sub-note">Available 24/7 for urgent shifting support</p>
                  </div>
                </a>

                {/* EMAIL */}
                <a href="mailto:customercare@packyatra.com" className="contact-detail-box-premium linkable-box">
                  <div className="box-icon-bg mail-bg">
                    <Mail size={22} />
                  </div>
                  <div className="box-content">
                    <h4>Email Support</h4>
                    <span className="box-highlight-value">customercare@packyatra.com</span>
                    <p className="box-sub-note">We answer corporate inquiries within 2 hours</p>
                  </div>
                </a>

                {/* TIMING */}
                <div className="contact-detail-box-premium">
                  <div className="box-icon-bg clock-bg">
                    <Clock size={22} />
                  </div>
                  <div className="box-content">
                    <h4>Working Hours</h4>
                    <span className="box-highlight-value">Mon - Sun: 24/7 Availability</span>
                    <p className="box-sub-note">Holiday services available upon booking reservation</p>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="contact-social-channels">
                <h4>Join Our Community</h4>
                <div className="social-badge-grid">
                  <a href="https://wa.me/9071535535" target="_blank" rel="noreferrer" className="social-btn whatsapp">
                    <i className="fab fa-whatsapp"></i>
                    <span>WhatsApp Chat</span>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61588337520152" target="_blank" rel="noreferrer" className="social-btn facebook">
                    <i className="fab fa-facebook-f"></i>
                    <span>Facebook</span>
                  </a>
                  <a href="https://www.instagram.com/pack.yatra?utm_source=qr&igsh=MXMwdXo1cTh6MGg3eQ==" target="_blank" rel="noreferrer" className="social-btn instagram">
                    <i className="fab fa-instagram"></i>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: PREMIUM CONTACT FORM */}
            <motion.div 
              className="contact-form-col"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="contact-form-card">
                <div className="form-card-header">
                  <div className="form-badge">⚡ INSTANT INQUIRY</div>
                  <h3>Submit an Online Inquiry</h3>
                  <p>Provide your details below to receive a call back and an instant estimates quotation.</p>
                </div>

                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.form 
                      key="contact-form"
                      onSubmit={handleFormSubmit}
                      className="premium-interactive-form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Name input */}
                      <div className="form-input-group">
                        <label className="form-input-label">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="E.g. Rajesh Kumar"
                          className="premium-text-input"
                          required
                        />
                      </div>

                      {/* Twin fields (Email & Phone) */}
                      <div className="form-input-row">
                        <div className="form-input-group">
                          <label className="form-input-label">Email Address</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="E.g. rajesh@example.com"
                            className="premium-text-input"
                            required
                          />
                        </div>

                        <div className="form-input-group">
                          <label className="form-input-label">Mobile Number</label>
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))}
                            placeholder="10-digit number"
                            maxLength={10}
                            className="premium-text-input"
                            required
                          />
                        </div>
                      </div>

                      {/* Dropdown for Shifting Service */}
                      <div className="form-input-group">
                        <label className="form-input-label">Select Shifting Service</label>
                        <select 
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className="premium-select-input"
                        >
                          <option value="Household Shifting">Household Shifting</option>
                          <option value="Office Relocation">Office Relocation</option>
                          <option value="Vehicle Transportation">Vehicle Transportation</option>
                          <option value="Warehouse & Storage">Warehouse & Storage</option>
                          <option value="Local Relocation">Local Shifting</option>
                        </select>
                      </div>

                      {/* Message area */}
                      <div className="form-input-group">
                        <label className="form-input-label">Your Message / Special Instructions</label>
                        <textarea 
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Let us know your shifting dates, items, or requirements..."
                          className="premium-textarea"
                          required
                        />
                      </div>

                      {/* Error notice */}
                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            className="form-error-alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <ShieldAlert size={16} />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        className="form-submit-btn-premium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="form-spinner-icon" />
                            <span>Sending Shifting Request...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Shifting Request</span>
                            <Send size={16} />
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success-container"
                      className="form-success-container"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                    >
                      <div className="success-icon-animation-wrapper">
                        <CheckCircle size={64} className="success-checkmark-vector" />
                      </div>
                      <h3>Thank You!</h3>
                      <p>Your shifting request has been received. Our moving experts will contact you on your mobile within 15 minutes to coordinate your booking.</p>
                      
                      <button 
                        onClick={() => setSuccess(false)}
                        className="success-reset-btn"
                      >
                        <span>Submit Another Shifting Request</span>
                        <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* EMBEDDED MAP OF BANGALORE HEAD OFFICE */}
      <section className="contact-map-section">
        <div className="container">
          <div className="map-title-wrapper">
            <h3>Find Our Bangalore Head Office</h3>
            <p>Visit us to plan large enterprise relocations or verify packing warehouses.</p>
          </div>
          <div className="map-frame-wrapper">
            <iframe 
              src="https://maps.google.com/maps?q=Packyatra%20Relocations%20Pvt.%20Ltd.%20122%2C%204th%20Main%2C%201st%20Stage%2C%201st%20Phase%2C%20West%20of%20Chord%20Road%2C%20Manjunath%20Nagar%2C%20Bangalore%20-%20560010%2C%20Karnataka%2C%20India&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="450" 
              style={{ border: "none" }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
