import React from "react";

const SunIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", margin: "auto" }}
  >
    {/* Outer border circle */}
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="#E74C3C"
      strokeWidth="3.5"
      fill="#fff"
    />
    {/* Sun icon */}
    <circle cx="20" cy="20" r="7" fill="#FFC700" />
    <g stroke="#FFC700" strokeWidth="2" strokeLinecap="round">
      <line x1="20" y1="7" x2="20" y2="3" />
      <line x1="20" y1="33" x2="20" y2="37" />
      <line x1="7" y1="20" x2="3" y2="20" />
      <line x1="33" y1="20" x2="37" y2="20" />
      <line x1="9.8" y1="9.8" x2="6.6" y2="6.6" />
      <line x1="30.2" y1="30.2" x2="33.4" y2="33.4" />
      <line x1="9.8" y1="30.2" x2="6.6" y2="33.4" />
      <line x1="30.2" y1="9.8" x2="33.4" y2="6.6" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", margin: "auto" }}
  >
    {/* Outer border circle */}
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="#E74C3C"
      strokeWidth="3.5"
      fill="#fff"
    />
    {/* Moon icon */}
    <path
      d="M29 27.5A11.5 11.5 0 1 1 19.5 9 9 9 0 0 0 29 27.5z"
      fill="#FFC700"
      stroke="#FFC700"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
      style={{ border: "none", background: "none", padding: 0 }}
    >
      {isDarkMode ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;
