import React, { useEffect, useState } from "react";

import "../styles/Termandcondition.css";

function TermsAndConditions() {
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
      <header>
        <h1>Terms and Conditions</h1>
        <div className="company-name">Packyatra Relocation Pvt. Ltd.</div>
        <p className="last-updated">Last Updated: {lastUpdated}</p>
      </header>

      <div className="content">
        <div className="intro-text">
          <p>
            Please read these terms and conditions carefully before using
            Packyatra Relocation Pvt. Ltd. moving and transportation services.
            By engaging with our services, you agree to be bound by these terms.
          </p>
        </div>

        <Section title="General Terms">
          <Item
            title="Valuables and Personal Items"
            desc="Customers must keep their cash, jewellery, and other valuables in their personal custody at all times. Packyatra Relocation Pvt. Ltd. will not be responsible for these items."
          />
          <Item
            title="Reporting Concerns"
            desc="Any concerns during or after the service must be immediately brought to the attention of the Packyatra Relocation Pvt. Ltd. team."
          />
        </Section>

        <Section title="Logistics and Vehicle Information">
          <div className="highlight-box">
            <p><strong>Important:</strong> Customers must provide:</p>
            <p>1. Vehicle entry availability</p>
            <p>2. Distance from parking to lift/house gate</p>
            <p>3. Allowed vehicle retention time</p>
          </div>

          <Item
            title="Liability Disclaimer"
            desc="Packyatra Relocation Pvt. Ltd. would not be liable for any mishappenings during the moving process."
          />
        </Section>

        <Section title="Packing Materials">
          <Item
            title="Company Property"
            desc="All packing materials are company property and will be taken back on the same day of unloading."
          />
          <Item
            title="Box Retention Charges"
            desc="If carton boxes are retained, ₹50 per carton box will be charged."
          />
        </Section>

        <Section title="Additional Charges">
          <Item
            title="Excluded Services"
            desc="Dismantling, electrical fittings, and other unmentioned services will incur extra charges."
          />
          <Item
            title="Mathadi and Union Labour"
            desc="Union labour charges are not included and must be paid by the client."
          />
        </Section>

        <Section title="Transportation Terms">
          <Item
            title="Owner's Risk"
            desc="All consignments are carried entirely at the owner's risk. Insurance is advised."
          />
          <Item
            title="Payment Discretion"
            desc="Payment terms are at the discretion of Packyatra Relocation Pvt. Ltd."
          />
        </Section>

        <Section title="Air Conditioning Services">
          <Item
            title="Service Charges Only"
            desc="Material costs such as pipes, gas, wiring, etc. are not included."
          />
        </Section>

        <Section title="Cancellation and Regional Limitations">
          <Item
            title="Service Cancellation"
            desc="If the movement is not executed, liability is limited to the token amount paid."
          />
        </Section>

        <Section title="Vehicle Transportation">
          <Item
            title="Car Transportation"
            desc="Packyatra is not responsible for any items left inside the car."
          />
          <Item
            title="Two-Wheeler Movement"
            desc="All personal items must be removed before transportation."
          />
          <Item
            title="Vehicle Condition"
            desc="Vehicles must be in good running condition; non-running vehicles may incur extra charges."
          />
          <Item
            title="Liability Disclaimer"
            desc="Packyatra Relocation Pvt. Ltd. is not liable for any damages during vehicle transportation."
          />
        </Section>

        <div className="note">
          <p>
            <strong>Note:</strong> These terms and conditions are subject to change
            without prior notice.
          </p>
        </div>
      </div>

      <footer>
        <p>
          For any queries or clarifications, please contact Packyatra Relocation
          Pvt. Ltd.
        </p>
        <div className="contact-info">
          support@packyatra.com | +91 96200 300342
        </div>
      </footer>
    </div>
  );
}

function Section(props) {
  return (
    <div className="terms-section">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}

function Item(props) {
  return (
    <div className="term-item">
      <div className="term-title">{props.title}</div>
      <div className="term-description">{props.desc}</div>
    </div>
  );
}

export default TermsAndConditions;
