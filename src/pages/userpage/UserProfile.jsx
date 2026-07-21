
export default function UserProfile() {
  return (
  <div className="container">
    <section className="user-section">
      <div className="section-header">
        <i className="fas fa-user-circle"></i>
        <h2>User Profile</h2>
      </div>

      <div className="user-profile">
        <div className="profile-header">
          <div className="profile-avatar">JD</div>

          <div className="profile-info">
            <h3>John Doe</h3>
            <p><i className="fas fa-envelope"></i> johndoe@example.com</p>
            <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Bookings</div>
              </div>

              <div className="stat-item">
                <div className="stat-value">8</div>
                <div className="stat-label">Completed</div>
              </div>

              <div className="stat-item">
                <div className="stat-value">2</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <h4>Member Since</h4>
            <p>March 15, 2022</p>
          </div>

          <div className="detail-item">
            <h4>Last Login</h4>
            <p>Today, 10:30 AM</p>
          </div>

          <div className="detail-item">
            <h4>Address</h4>
            <p>123 Main Street, New York, NY 10001</p>
          </div>

          <div className="detail-item">
            <h4>Preferred Service</h4>
            <p>Household Relocation</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary">
            <i className="fas fa-edit"></i> Edit Profile
          </button>

          <button className="btn btn-secondary">
            <i className="fas fa-cog"></i> Settings
          </button>

          <button className="btn btn-secondary">
            <i className="fas fa-question-circle"></i> Help
          </button>
        </div>
      </div>
    </section>
    <BookingPage />
  </div>
  )
}
