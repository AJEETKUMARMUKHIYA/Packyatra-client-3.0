// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../utils/auth';
import { getUserProfileWithBookings } from '../utils/userService';
import BookingSection from './BookingSection';
import '../styles/UserProfile.css';

const UserProfile = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isOpen) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userInfo = getUserInfo();
        const userId = userInfo?.userID || userInfo?.id;
        //console.log('Current User ID:', userId);
        
        if (!userId) {
          setError('User not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch user profile with bookings
        const profileData = await getUserProfileWithBookings(userId);
        //console.log('Profile data loaded:', profileData);
        
        if (profileData) {
          setUserData(profileData);
          if (profileData.bookings) {
            setBookings(profileData.bookings);
          }
        } else {
          setError('Failed to load user profile data');
        }
      } catch (err) {
        console.error('Error in loadUserData:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Listen for login events
    const handleLogin = () => {
      loadUserData();
    };

    window.addEventListener('user-login', handleLogin);
    window.addEventListener('booking-update', loadUserData);
    
    return () => {
      window.removeEventListener('user-login', handleLogin);
      window.removeEventListener('booking-update', loadUserData);
    };
  }, [isOpen]);

  // Close modal when clicking outside or pressing ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleEditProfile = () => {
    alert('Edit profile feature coming soon!');
  };

  const handleSettings = () => {
    alert('Settings feature coming soon!');
  };

  const handleHelp = () => {
    alert('Help feature coming soon!');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop/Overlay */}
      <div className="profile-modal-overlay" onClick={onClose}></div>
      
      {/* Profile Modal */}
      <div className="profile-modal">
        {/* Close Button - Top Right */}
        <button className="profile-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        {/* Modal Content */}
        <div className="profile-modal-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading your profile...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : !userData ? (
            <div className="no-data-container">
              <div className="no-data-icon">👤</div>
              <h3>No Profile Found</h3>
              <p>Please log in to view your profile</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Tabs Navigation */}
              <div className="profile-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user"></i> Profile
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <i className="fas fa-suitcase"></i> Bookings
                  {bookings.length > 0 && (
                    <span className="badge">{bookings.length}</span>
                  )}
                </button>
              </div>

              {/* Profile Tab Content */}
              {activeTab === 'profile' && (
                <section className="user-section">
                  {/* <div className="section-header">
                    <div className="section-title">
                       <i className="fas fa-user-circle"></i>
                    <h2>User Profile</h2>
                    </div>
                  </div> */}

                  <div className="user-profile">
                    {/* Profile Header */}
                    <div className="profile-header">
                      <div className="profile-avatar">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div className="profile-info">
                        <h3>{userData.name || 'User'}</h3>
                        <div className="contact-info">
                          <p>
                            <i className="fas fa-envelope"></i> 
                            {userData.email || 'No email provided'}
                          </p>
                          <p>
                            <i className="fas fa-phone"></i> 
                            {userData.phoneNumber || userData.phone || 'No phone provided'}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="profile-stats">
                          <div className="stat-item">
                            <div className="stat-value">{userData.totalBookings || 0}</div>
                            <div className="stat-label">Total Bookings</div>
                          </div>

                          <div className="stat-item">
                            <div className="stat-value">{userData.completedBookings || 0}</div>
                            <div className="stat-label">Completed</div>
                          </div>

                          <div className="stat-item">
                            <div className="stat-value">{userData.pendingBookings || 0}</div>
                            <div className="stat-label">Pending</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="profile-details">
                      <div className="detail-item">
                        <h4><i className="fas fa-calendar-plus"></i> Member Since</h4>
                        <p>{userData.memberSince || 'Not available'}</p>
                      </div>

                      <div className="detail-item">
                        <h4><i className="fas fa-clock"></i> Last Login</h4>
                        <p>{userData.lastLogin || 'Not available'}</p>
                      </div>

                      <div className="detail-item">
                        <h4><i className="fas fa-map-marker-alt"></i> Address</h4>
                        <p>{userData.address || 'Not available'}</p>
                      </div>

                      <div className="detail-item">
                        <h4><i className="fas fa-star"></i> Preferred Service</h4>
                        <p>{userData.preferredService || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="action-buttons">
                      <button className="btn btn-primary" onClick={handleEditProfile}>
                        <i className="fas fa-edit"></i> Edit Profile
                      </button>

                      <button className="btn btn-secondary" onClick={handleSettings}>
                        <i className="fas fa-cog"></i> Account Settings
                      </button>

                      <button className="btn btn-secondary" onClick={handleHelp}>
                        <i className="fas fa-question-circle"></i> Help & Support
                      </button>
                    </div> */}
                  </div>
                </section>
              )}

              {/* Bookings Tab Content */}
              {activeTab === 'bookings' && (
                <div className="booking-section-modal">
                  <BookingSection initialBookings={bookings} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;