import React from "react";
import "../App.css";

const HowToPlayModal = ({ open, onClose }) => {
  if (!open) return null;

  // Handler to close only if overlay (not modal content) is clicked
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="howto-modal-overlay"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={handleOverlayClick}
    >
      <div className="howto-modal-content">
        <button
          className="howto-modal-close"
          onClick={onClose}
          aria-label="Close How to Play"
        >
          &times;
        </button>
        <h2>How to Play</h2>
        <div className="howto-description">
          <p>
            <strong>Welcome to the Money Game!</strong> This is a strategic
            multiplayer game that explores cooperation, trust, and social
            dynamics. Each player receives 100 points per round for three
            rounds, but reaching the 1000-point goal requires teamwork and smart
            decisions.
          </p>
          <ul>
            <li>
              Donate points to other players each round. Any donations you
              receive are <strong>doubled</strong>!
            </li>
            <li>
              No one knows how much money the others have—build trust and
              strategize to win.
            </li>
            <li>
              If nobody collaborates, everyone loses. Work together, but be
              careful who you trust.
            </li>
            <li>
              Send a short message with each donation to communicate or bluff.
              Inappropriate content is filtered.
            </li>
            <li>
              After three rounds, see who reached the goal and how your choices
              shaped the outcome.
            </li>
          </ul>
          <p className="howto-inspiration">
            <em>
              Every round is a chance to build alliances, outwit your rivals,
              and test your instincts. Can you read the room, earn trust, and
              help everyone win—or will suspicion and secrecy get in the way?
              The outcome is in your hands!
            </em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
