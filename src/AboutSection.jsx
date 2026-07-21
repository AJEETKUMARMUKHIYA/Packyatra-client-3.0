import React, { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', message:'' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${formData.name}! Your message has been sent.`);
    setFormData({ name:'', email:'', phone:'', message:'' });
  };

  return (
    <section className="contact-section">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
        <input placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} />
        <input placeholder="Phone" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
        <textarea placeholder="Message" value={formData.message} onChange={e=>setFormData({...formData, message:e.target.value})}></textarea>
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default ContactSection;
