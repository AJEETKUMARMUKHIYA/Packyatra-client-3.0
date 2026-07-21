import React, { useEffect } from "react";

const useScalePage = () => {
  useEffect(() => {
    const handleResize = () => {
      // Base dimensions for scaling
      const baseWidth = 1920;
      const baseHeight = 1080;

      // Calculate the scale factor for width and height
      const scaleWidth = window.innerWidth / baseWidth;
      const scaleHeight = window.innerHeight / baseHeight;

      // Use the smaller scale factor for uniform scaling
      const scale = Math.min(scaleWidth, scaleHeight);

      // Apply the scaling to the container
      const container = document.querySelector(".page-container");
      if (container) {
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = "top left";
        container.style.width = `${baseWidth}px`; // Ensure container width matches the base
        container.style.height = `${baseHeight}px`; // Ensure container height matches the base
        container.style.overflow = "hidden"; // Prevent content overflow
        container.style.margin = "0"; // Remove unintended margins
      }

      // Prevent white space by adjusting the body size
      document.body.style.width = `${baseWidth * scale}px`;
      document.body.style.height = `${baseHeight * scale}px`;
      document.body.style.overflow = "hidden"; // Hide overflow to prevent scrolling
    };

    handleResize(); // Call the function on initial load
    window.addEventListener("resize", handleResize); // Listen for window resize events

    return () => window.removeEventListener("resize", handleResize); // Clean up the event listener
  }, []);
};

export default useScalePage;
