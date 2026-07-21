import React, { useEffect, useState } from "react";
import "../styles/Termandcondition.css";

function Policies() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date();
    setLastUpdated(`${months[date.getMonth()]} ${date.getFullYear()}`);
  }, []);

  return (
    <div className="container">
       <h1>Packyatra payment Policy</h1>
      
      {/* ================= PAGE HEADER ================= */}
      <header>
        
        <div className="company-name">Packyatra Movers & Packers</div>
        <p className="last-updated">Last Updated: {lastUpdated}</p>
      </header>

      <div className="content">

        {/* ================= REFUND POLICY ================= */}
        <Section title="Payment Option & Refund Policy">
           <p>Packyatra provides customers with multiple secure payment methods to ensure a smooth and convenient booking experience. Payments can be made using UPI, credit cards, debit cards, net banking, or a secure payment link shared by our team.</p>

           <p>To confirm a booking, customers are required to pay an initial token amount of 10% of the total service value. This helps us reserve the vehicle, manpower, and schedule the service.</p>

           <p>The remaining payment can be made in stages, aligned with the progress of the work, allowing customers flexibility and transparency throughout the relocation process. Customers may choose to complete the payment either partially or in full, based on the agreed milestones.</p>

           <p>Packyatra aims to make the payment process simple, secure, and customer-friendly while ensuring clarity at every step.</p>
               <Section title="Pricing Note: All prices are in INR">
          <div className="highlight-box">
            <p>All amounts, charges, fees, and prices mentioned or quoted by Packyatra Movers & Packers are in Indian Rupees (INR ₹) only, unless explicitly stated otherwise.</p>
          </div>
        </Section>
          <SubSection title="1. Booking / Token Amount All prices are in INR">
            <Item desc="The booking or token amount is collected to confirm service scheduling, manpower allocation, and vehicle reservation." />
            <Item desc="If a cancellation request is raised well in advance, Packyatra may approve a partial or full refund based on service planning status." />
          </SubSection>

          <SubSection title="2. Customer-Initiated Cancellation">
            <Item desc="Cancellations made before vehicle dispatch may be eligible for a refund of the amount paid beyond the token amount, after applicable processing charges." />
            <Item desc="Cancellations close to the scheduled date may be rescheduled instead of cancelled, subject to availability." />
          </SubSection>

          <SubSection title="3. Non-Execution of Service">
            <Item desc="If Packyatra is unable to execute the service due to unforeseen circumstances, liability shall be limited to the token amount paid." />
          </SubSection>

          <SubSection title="4. Service Delays">
            <Item desc="Delays due to traffic, weather, strikes, or local regulations may occur. Packyatra will coordinate closely to minimize inconvenience." />
          </SubSection>

          <SubSection title="5. Additional Services">
            <Item desc="Payments for additional services are refundable only if the service has not been initiated." />
          </SubSection>

          <SubSection title="6. Refund Processing">
            <Item desc="Approved refunds are processed within 7–10 working days." />
            <Item desc="Refunds are credited to the original mode of payment." />
          </SubSection>
           
          <SubSection title="7. Our Commitment to You">
          <Item
            desc="We aim to resolve concerns quickly and fairly."
          />
            <Item
            desc="Every refund request is reviewed with a customer-first approach."
            />
            <Item
            desc="Our goal is to ensure you feel confident and supported throughout your moving journey."
          />
        </SubSection>
        </Section>

        <hr className="section-divider" />

      </div>

      <footer>
        <p>For any refund or privacy-related concerns, contact:</p>
        <div className="contact-info">
          support@packyatra.com | +91-90715 35535
        </div>
      </footer>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function Section({ title, children }) {
  return (
    <div className="terms-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="sub-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Item({ desc }) {
  return (
    <div className="term-item">
      <div className="term-description">{desc}</div>
    </div>
  );
}

export default Policies;
