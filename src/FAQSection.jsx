import React, { useState } from "react";

const FAQSection = () => {
  const faqs = [
    { question: "How to book?", answer: "You can book online via our form." },
    { question: "What is the pricing?", answer: "Pricing depends on distance and services." },
    { question: "Do you provide packing?", answer: "Yes, we provide packing services." }
  ];
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <section className="faq-section">
      <h2>FAQs</h2>
      {faqs.map((faq, index) => (
        <div key={index} className={`faq-item ${activeFaq===index?'active':''}`}>
          <div className="faq-question" onClick={()=>setActiveFaq(activeFaq===index?null:index)}>{faq.question}</div>
          {activeFaq===index && <div className="faq-answer">{faq.answer}</div>}
        </div>
      ))}
    </section>
  );
};

export default FAQSection;
