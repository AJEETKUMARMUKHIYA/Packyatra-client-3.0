import React from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Target, 
  Eye, 
  Heart, 
  Award, 
  ShieldCheck, 
  Handshake, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Users,
  CheckCircle2
} from "lucide-react";
import "../styles/About.css";

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120
      }
    }
  };

  return (
    <div className="about-page">
      {/* Dynamic Header Banner */}
      <section className="about-hero-section">
        <div className="about-hero-overlay" />
        <div className="about-hero-container">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="about-badge"
          >
            🌟 About Packyatra
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="about-title"
          >
            Redefining Relocation in India
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="about-subtitle"
          >
            Since 2025, we've been crafting stress-free, secure, and professional moving experiences built on absolute trust.
          </motion.p>
        </div>
      </section>

      {/* CORE STATS BANNER */}
      <section className="stats-banner-section">
        <div className="stats-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="stats-grid-wrapper"
          >
            <div className="stat-box">
              <div className="stat-number">1+</div>
              <div className="stat-label">Years of Trust</div>
            </div>
            <div className="stat-divider-line" />
            <div className="stat-box">
              <div className="stat-number">10+</div>
              <div className="stat-label">Cities Nationwide</div>
            </div>
            <div className="stat-divider-line" />
            <div className="stat-box">
              <div className="stat-number">220+</div>
              <div className="stat-label">Families Shifted</div>
            </div>
            <div className="stat-divider-line" />
            <div className="stat-box">
              <div className="stat-number">99.8%</div>
              <div className="stat-label">Damage-Free Rate</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story & Mission Grid */}
      <section className="story-mission-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-pre-title">OUR PILLARS</span>
            <h2>Our Story & Foundations</h2>
            <p className="section-desc">The driving principles behind our reputation as India's premier movers.</p>
          </div>

          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="feature-card-premium" variants={itemVariants}>
              <div className="feature-card-header">
                <div className="feature-icon-wrapper orange">
                  <History size={26} />
                </div>
                <h3>Our Journey</h3>
              </div>
              <p>
                Founded in 2008, Packyatra started with a single truck and a 
                bold vision to revolutionize India's moving sector. Today, we stand 
                as a fully certified relocation ecosystem, carrying forward decades 
                of service consistency.
              </p>
              <div className="card-decor-line" />
            </motion.div>

            <motion.div className="feature-card-premium" variants={itemVariants}>
              <div className="feature-card-header">
                <div className="feature-icon-wrapper blue">
                  <Target size={26} />
                </div>
                <h3>Our Mission</h3>
              </div>
              <p>
                To provide exceptional packing and moving solutions through 
                complete transparency, cutting-edge scheduling, and strict protection 
                protocols, removing any uncertainty from relocation.
              </p>
              <div className="card-decor-line" />
            </motion.div>

            <motion.div className="feature-card-premium" variants={itemVariants}>
              <div className="feature-card-header">
                <div className="feature-icon-wrapper green">
                  <Eye size={26} />
                </div>
                <h3>Our Vision</h3>
              </div>
              <p>
                To become the absolute digital benchmark for logistics and residential relocations 
                in India, empowering both clients and workers with safe, verified, and 
                durable workflows.
              </p>
              <div className="card-decor-line" />
            </motion.div>

            <motion.div className="feature-card-premium" variants={itemVariants}>
              <div className="feature-card-header">
                <div className="feature-icon-wrapper violet">
                  <Heart size={26} />
                </div>
                <h3>Our Core Values</h3>
              </div>
              <p>
                Customer-first ownership, active insurance coverage, complete price 
                honesty without surprise costs, and thorough safety standards are 
                the foundations of every booking we schedule.
              </p>
              <div className="card-decor-line" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Certifications & Recognition Section */}
      <section className="certifications-dark-section">
        <div className="container">
          <div className="dark-section-header">
            <span className="badge-dark-pill">🛡️ ACCREDITED SYSTEMS</span>
            <h2>Our Certifications & Trust Seals</h2>
            <p>Every shipment is protected by globally recognized regulatory standards.</p>
          </div>

          <div className="services-grid">
            

            <motion.div 
              className="cert-card-premium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="cert-icon-bg bg-blue">
                <ShieldCheck size={24} />
              </div>
              <div className="cert-content">
                <h3>100% Comprehensive Insurance</h3>
                <p>
                  Partnered with premium nationwide underwriters to offer effortless 
                  transit damage protections, securing your assets completely.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="cert-card-premium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="cert-icon-bg bg-green">
                <Handshake size={24} />
              </div>
              <div className="cert-content">
                <h3>Registered IPMA Partner</h3>
                <p>
                  A registered member of the Indian Packers & Movers Association, adhering 
                  strictly to the national code of ethical shipping practices.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US DECORATIVE ROW */}
      <section className="why-row-section">
        <div className="container">
          <div className="why-split-container">
            <div className="why-text-col">
              <span className="pill-blue-light">✨ EXCELLENCE IN WORKFLOW</span>
              <h2>Why Indian Families Prefer Packyatra</h2>
              <p className="why-main-description">
                Relocation is not just about moving cargo; it’s about safely stepping into your next life chapter. We focus on absolute professional discipline at every checkpoint.
              </p>
              
              <ul className="why-bullets-list">
                <li>
                  <CheckCircle2 size={18} className="bullet-check" />
                  <span><strong>Zero Subcontracting:</strong> 100% in-house background-checked packing experts.</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="bullet-check" />
                  <span><strong>Double-Layer Safety:</strong> Heavy-duty bubble wraps, corrugated sheets, and customized wooden crates.</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="bullet-check" />
                  <span><strong>No Hidden Charges:</strong> Upfront quotation matching our invoice to the exact rupee.</span>
                </li>
              </ul>
            </div>
            
            <div className="why-illustration-col">
              <div className="trust-card-fancy">
                <div className="fancy-icon">🏆</div>
                <h4>India's Leading Moving Ecosystem</h4>
                <p>Ensuring absolute protection for your furniture, glassware, appliances, and precious memories.</p>
                <a href="/#booking" className="fancy-cta-btn">
                  <span>Start Your Quotation</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
