import React from "react";

import "../styles/Team.css"; // you can create and reuse global CSS if already present
const Team = () => {
  return (
    <>
      {/* Hero Banner */}
      <div className="team-page">
      <section className="hero-banner team-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Meet Our Team</h1>
            <p>
              Our dedicated team of professionals committed to making your
              relocation experience smooth and stress-free.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-title">
            <h2>Leadership Team</h2>
            <p>
              Experienced professionals leading our operations with expertise
              and dedication
            </p>
          </div>

          <div className="team-grid">
            {/* Team Member 1 */}
            <div className="team-member">
              <div className="member-img">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80"
                  alt="Rajesh Kumar"
                />
              </div>
              <div className="member-info">
                <h3>Rajesh Kumar</h3>
                <div className="position">Founder & CEO</div>
                <p>
                  20+ years of experience in logistics and the moving industry.
                  Founded Packyatra with a vision to revolutionize relocation
                  services.
                </p>
                <div className="member-social">
                  <a href="#"><i className="fab fa-linkedin"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="team-member">
              <div className="member-img">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                  alt="Priya Sharma"
                />
              </div>
              <div className="member-info">
                <h3>Priya Sharma</h3>
                <div className="position">Operations Head</div>
                <p>
                  15+ years of experience in operations management. Ensures smooth
                  execution of all moving projects with precision and care.
                </p>
                <div className="member-social">
                  <a href="#"><i className="fab fa-linkedin"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default Team;
