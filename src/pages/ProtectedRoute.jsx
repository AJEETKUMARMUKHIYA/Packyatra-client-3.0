import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if already authenticated (so popup doesn't show again)
  const isAuthenticated = sessionStorage.getItem("ticketAuth");

  if (!isAuthenticated) {
    // 🔐 JavaScript Popup
    const username = window.prompt("Enter Username:");
    const password = window.prompt("Enter Password:");

    // Hardcoded credentials
    if ((username === "payal" ||username === "nitu" ||username === "pradeep" ||username === "pawan" ||username === "swathi" ||username === "durga" )&& password === "pass@091") {
      sessionStorage.setItem("ticketAuth", "true");
      return children;
    } else {
      alert("Invalid Credentials!");
      return <Navigate to="/ticket-booking" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
