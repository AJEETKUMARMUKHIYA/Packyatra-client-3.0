import React from "react";

import "../styles/Services.css"; // you can create and reuse global CSS if already present
const Services = () => {
  return (
    <>
    <div className="services-page">
      {/* Hero Banner */}
      <section className="hero-banner services-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Our Services</h1>
            <p>
              Comprehensive packing and moving solutions for every need, from
              local shifts to international relocations.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="services-grid">
            {/* Household Shifting */}
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="service-content">
                <h3>Household Shifting</h3>
                <p>
                  Complete home relocation services including packing, loading,
                  transportation, unloading, and unpacking.
                </p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> Complete packing & unpacking</li>
                  <li><i className="fas fa-check"></i> Furniture disassembly & assembly</li>
                  <li><i className="fas fa-check"></i> Fragile items special handling</li>
                  <li><i className="fas fa-check"></i> Vehicle transportation</li>
                  <li><i className="fas fa-check"></i> Cleaning services available</li>
                </ul>
              </div>
            </div>

            {/* Office Relocation */}
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-building"></i>
              </div>
              <div className="service-content">
                <h3>Office Relocation</h3>
                <p>
                  Efficient office moving with minimal business disruption,
                  including IT infrastructure handling.
                </p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> IT equipment handling</li>
                  <li><i className="fas fa-check"></i> Document packing & moving</li>
                  <li><i className="fas fa-check"></i> Furniture relocation</li>
                  <li><i className="fas fa-check"></i> Weekend/after-hours moving</li>
                  <li><i className="fas fa-check"></i> Post-move setup & support</li>
                </ul>
              </div>
            </div>
            {/* Packing & Storage */}
            <div className="service-card">
              <div className="service-icon">      
                <i className="fas fa-box-open"></i> 
              </div>
              <div className="service-content">
                <h3>Packing & Storage</h3>
                <p>
                  Professional packing services and secure storage solutions for
                  short or long-term needs.
                </p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> Premium packing materials</li>
                  <li><i className="fas fa-check"></i> Climate-controlled storage</li>

                  <li><i className="fas fa-check"></i> Inventory management</li>
                  <li><i className="fas fa-check"></i> Short & long-term storage</li>
                </ul>
              </div>      
            </div>

            {/* Transportation Services */}     
            <div className="service-card">  
              <div className="service-icon">      
                <i className="fas fa-truck"></i> 
              </div>    
              <div className="service-content"> 
                <h3>Transportation Services</h3>
                <p> 
                  Reliable and timely transportation across India with GPS  tracking.
                </p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> Fleet of modern vehicles</li>
                  <li><i className="fas fa-check"></i> GPS tracking</li>
                  <li><i className="fas fa-check"></i> On-time delivery</li>
                  <li><i className="fas fa-check"></i> Nationwide coverage</li>
                </ul>
              </div>      

            </div>  
          <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-shield-alt"></i>
              </div>          
              <div className="service-content"> 
                <h3>Why Choose Us?</h3>             
                <ul className="service-features">   
                  <li><i className="fas fa-check"></i> 100% Insured Shipments</li>
                  <li><i className="fas fa-check"></i> GPS Tracking</li>
                  <li><i className="fas fa-check"></i> Transparent Pricing</li>
                  <li><i className="fas fa-check"></i> Expert & Trained Staff</li>
                  <li><i className="fas fa-check"></i> On-Time Delivery</li>
                  <li><i className="fas fa-check"></i> 24/7 Customer Support</li>
                  <li><i className="fas fa-check"></i> Nationwide Network</li>
                </ul>
              </div>
          </div>
        </div>    
      </div>
      </section>
      </div>
    </>
  );
};

export default Services;
