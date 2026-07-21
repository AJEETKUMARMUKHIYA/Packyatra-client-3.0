import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    //console.log("Scrolling to top for path:", pathname); // Debug log
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Changed to smooth for testing
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
