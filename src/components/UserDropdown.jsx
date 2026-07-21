import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearLoginData, getUserInfo } from "../utils/auth";
import { getUserProfileWithBookings, getUserBookings } from "../utils/userService";
import UserProfile from "./UserProfile"; // ADD THIS BACK
import "../styles/UserDropdown.css";

export default function UserDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // ADD THIS
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load user data and booking stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userInfo = getUserInfo();
        setUser(userInfo);

        // If user is logged in, fetch booking stats
        if (userInfo) {
          const userId = userInfo.userId || userInfo.id;
          if (userId) {
            setLoading(true);
            
            try {
              // Option 1: Get complete profile with stats
              const profileWithBookings = await getUserProfileWithBookings(userId);
              
              if (profileWithBookings) {
                setBookingStats({
                  total: profileWithBookings.totalBookings || 0,
                  pending: profileWithBookings.pendingBookings || 0,
                  completed: profileWithBookings.completedBookings || 0
                });
              } else {
                // Option 2: Get bookings separately
                const bookings = await getUserBookings(userId);
                if (bookings.length > 0) {
                  const total = bookings.length;
                  const pending = bookings.filter(b => b.status === 'pending').length;
                  const completed = bookings.filter(b => 
                    b.status === 'completed' || b.status === 'confirmed'
                  ).length;
                  
                  setBookingStats({ total, pending, completed });
                }
              }
            } catch (err) {
              console.error("Error loading booking stats:", err);
            } finally {
              setLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setLoading(false);
      }
    };

    loadUserData();
    
    // Listen for login/logout events
    window.addEventListener("user-login", loadUserData);
    window.addEventListener("user-logout", () => {
      setUser(null);
      setBookingStats({ total: 0, pending: 0, completed: 0 });
      setShowProfileModal(false); // Close modal on logout
    });
    window.addEventListener("storage", loadUserData);
    window.addEventListener("booking-update", loadUserData);

    return () => {
      window.removeEventListener("user-login", loadUserData);
      window.removeEventListener("user-logout", loadUserData);
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("booking-update", loadUserData);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    clearLoginData();
    setUser(null);
    setBookingStats({ total: 0, pending: 0, completed: 0 });
    setShowProfileModal(false); // Close modal on logout
    onLogout?.();
    setOpen(false);
    navigate("/");
    window.dispatchEvent(new Event("user-logout"));
  };

  // Handle profile click - show modal instead of navigating
  const handleProfileClick = () => {
    setOpen(false);
    setShowProfileModal(true);
  };

  // Handle menu item clicks
  const handleMenuItemClick = (path) => {
    setOpen(false);
    navigate(path);
  };

  // Handle quick action clicks
  const handleQuickAction = (action, bookingId) => {
    setOpen(false);
    switch (action) {
      case 'new-booking':
        navigate("/book-service");
        break;
      case 'track-shipment':
        navigate("/track-shipment");
        break;
      case 'view-booking':
        navigate(`/booking/${bookingId}`);
        break;
      default:
        navigate("/bookings");
    }
  };

  // Format mobile number for display
  const formatMobile = (mobile) => {
    if (!mobile) return '';
    // Remove any non-digit characters
    const digits = mobile.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
      return `+91${digits.slice(0, 3)} ${digits.slice(3, 6)}${digits.slice(6)}`;
    }
    return mobile;
  };

  // Don't show dropdown if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="right-section">
      <div className="user-info-container" ref={dropdownRef}>
        {/* USER BUTTON */}
        {/* <div className="user-info" onClick={() => setOpen((prev) => !prev)}>
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <span className="user-greeting">Hi, {user.name || 'User'}</span>
            <span className="user-mobile">{formatMobile(user.mobile)}</span>
          </div>
          <i className={`fas fa-chevron-down dropdown-icon ${open ? "rotate" : ""}`}></i>
        </div> */}
           <div className="user-info" onClick={() => setOpen((prev) => !prev)}>
              <i className={`fas fa-user-circle ${open ? "rotate" : ""}`}></i>
               <span className="user-mobile">Profile</span>
          </div>

        {/* DROPDOWN OVERLAY */}
        {open && (
          <div 
            className="dropdown-overlay active" 
            onClick={() => setOpen(false)}
          />
        )}

        {/* DROPDOWN MENU */}
        {open && (
          <div className="dropdown-menu">
            {/* User Header with Stats */}
            <div className="dropdown-header">
              {/* <div className="header-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div> */}
              <div className="header-info">
                {/* <div className="header-name">{user.name || 'User'}</div> */}
                {/* <div className="header-email">{user.email || formatMobile(user.mobile)}</div> */}
                
                {/* Booking Stats */}
               
              </div>
            </div>

           
            {/* Menu Items */}
            <div className="menu-section">
             
              
              {/* Profile Button - Opens Modal */}
              <div 
                className="dropdown-item"
                onClick={handleProfileClick}
              >
                <i className="fas fa-user"></i>
                <span>My Profile</span>
                {loading && <i className="fas fa-spinner fa-spin"></i>}
              </div>
              
            

              <div 
                className="dropdown-item"
                onClick={() => handleMenuItemClick("/track-shipment")}
              >
                <i className="fas fa-map-marker-alt"></i>
                <span>Track Shipment</span>
              </div>
            </div>


            {/* Logout Button */}
            <div className="dropdown-item logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </div>

            {/* Footer */}
            <div className="dropdown-footer">
              <div className="footer-text">
                {bookingStats.pending > 0 ? (
                  <span className="pending-alert">
                    <i className="fas fa-exclamation-circle"></i>
                    You have {bookingStats.pending} pending booking{bookingStats.pending > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="all-clear">
                    <i className="fas fa-check-circle"></i>
                    All bookings are up to date
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <UserProfile 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}