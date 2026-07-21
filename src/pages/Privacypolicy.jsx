import React, { useEffect, useState } from "react";
import "../styles/Termandcondition.css";

function PravacyPolicies() {
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
       <h1>Packyatra privacy Policy</h1>
      
      {/* ================= PAGE HEADER ================= */}
      <header>
        
        <div className="company-name">Packyatra Movers & Packers</div>
        <p className="last-updated">Last Updated: {lastUpdated}</p>
      </header>

      <div className="content">

        {/* ================= PRIVACY POLICY ================= */}
        <Section title="Privacy Policy:-">

          <SubSection title="1. Scope">
            <Item desc="This Privacy Policy governs the collection, processing, storage, and disclosure of personal information by Packyatra Movers & Packers." />
            <Item desc="By using our services, you agree to the terms outlined in this policy." />
          </SubSection>

          <SubSection title="2. Information We Collect">
            <Item desc="Personal information including name, phone number, email address, and pickup/delivery addresses." />
            <Item desc="Service-related details such as inventory, moving dates, vehicle requirements, and service preferences." />
            <Item desc="Payment and transaction details excluding sensitive banking credentials." />
            <Item desc="Communication records including calls, emails, WhatsApp messages, and feedback." />
          </SubSection>

          <SubSection title="3. Purpose of Data Use">
            <Item desc="To execute relocation services and fulfill contractual obligations." />
            <Item desc="To manage logistics, billing, customer communication, and dispute resolution." />
            <Item desc="To comply with legal and regulatory requirements." />
          </SubSection>

          <SubSection title="4. Legal Basis for Processing">
            <Item desc="Customer consent, contractual necessity, legal compliance, and legitimate business interests." />
          </SubSection>

          <SubSection title="5. Sharing of Information">
            <Item desc="Information may be shared with internal teams, drivers, packers, service partners, and payment gateways strictly on a need-to-know basis." />
            <Item desc="Information may be disclosed to government or regulatory authorities if legally required." />
            <Item desc="Packyatra does not sell or commercially exploit customer data." />
          </SubSection>

          <SubSection title="6. Data Security">
            <Item desc="Reasonable technical, administrative, and physical safeguards are implemented to protect customer data." />
            <Item desc="Packyatra does not guarantee absolute security against cyber threats." />
          </SubSection>

          <SubSection title="7. Data Retention">
            <Item desc="Customer data is retained only as long as necessary for legal, operational, or statutory purposes." />
          </SubSection>

          <SubSection title="8. Customer Rights">
            <Item desc="Customers may request access, correction, or deletion of personal information, subject to applicable laws." />
            <Item desc="Requests may be denied if retention is legally required." />
          </SubSection>

          <SubSection title="9. Cookies & Tracking">
            <Item desc="Cookies may be used to enhance website functionality and analyze traffic." />
          </SubSection>

          <SubSection title="10. Third-Party Links">
            <Item desc="Packyatra is not responsible for privacy practices of third-party websites." />
          </SubSection>

          <SubSection title="11. Limitation of Liability">
            <Item desc="Packyatra shall not be liable for indirect or consequential damages arising from unauthorized data access beyond reasonable control." />
          </SubSection>

          <SubSection title="12. Policy Updates">
            <Item desc="Packyatra reserves the right to update these policies at any time without prior notice." />
            <Item desc="Continued use of services constitutes acceptance of the updated policies." />
          </SubSection>

          <SubSection title="13. Governing Law">
            <Item desc="These policies are governed by the laws of India, with exclusive jurisdiction of Indian courts." />
          </SubSection>

        </Section>

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

export default PravacyPolicies;
