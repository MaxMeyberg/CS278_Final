import React from "react";

const SunIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "block" }}
  >
    <circle cx="12" cy="12" r="5" fill="#FFC700" />
    <g stroke="#FFC700" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "block" }}
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill="#FFC700"
      stroke="#FFC700"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    style={{ display: "block" }}
  >
    <circle
      cx="14"
      cy="14"
      r="12"
      stroke="#E74C3C"
      strokeWidth="2.5"
      fill="#fff"
    />
    <rect x="13.1" y="12" width="1.8" height="8" rx="0.9" fill="#E74C3C" />
    <rect x="13.1" y="7.2" width="1.8" height="1.8" rx="0.9" fill="#E74C3C" />
  </svg>
);

const CornerButtons = ({ isDarkMode, onToggleTheme, onInfoClick }) => {
  return (
    <>
      {/* Left button: Theme toggle */}
      <div className="corner-btn corner-btn-left">
        <button
          className="corner-simple-btn"
          onClick={onToggleTheme}
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDarkMode ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
      {/* Right button: Info icon */}
      <div className="corner-btn corner-btn-right">
        <button
          className="corner-simple-btn"
          onClick={onInfoClick}
          aria-label="How to Play"
        >
          <InfoIcon />
        </button>
      </div>
    </>
  );
};

export default CornerButtons;
