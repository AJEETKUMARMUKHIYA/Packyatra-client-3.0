// utils/auth.js

// Check if OTP login is valid (within 30 minutes)
export const isOtpValid = () => {
  const loginTime = localStorage.getItem("otpLoginTime");
  if (!loginTime) return false;
  
  const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
  return Date.now() - parseInt(loginTime) < thirtyMinutes;
};

// Get current user info
export const getUserInfo = () => {
  const mobile = localStorage.getItem("mobile");
  const userID = localStorage.getItem("userID");
  
  if (!mobile || !isOtpValid()) {
    return null; // No valid session
  }
  
  return {
    mobile,
    userID: userID || mobile,
    name: localStorage.getItem("userName") || "User",
    loginType: "OTP"
  };
};

// Clear login data
export const clearLoginData = () => {
  localStorage.removeItem("mobile");
  localStorage.removeItem("userID");
  localStorage.removeItem("userName");
  localStorage.removeItem("otpLoginTime");
  localStorage.removeItem("loginType");
  window.dispatchEvent(new Event("user-logout"));
};