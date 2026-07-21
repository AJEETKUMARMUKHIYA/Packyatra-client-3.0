import React from "react";

const PackyatraAvatar = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}   // ✅ prevents inline misalignment
  >
    <circle cx="32" cy="32" r="32" fill="#2563eb" />
    <text
      x="32"
      y="36"                      // ✅ slightly lower for visual centering
      textAnchor="middle"
      fontSize="26"
      fontWeight="800"
      fill="#ffffff"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      PY
    </text>
  </svg>
);

export default PackyatraAvatar;
