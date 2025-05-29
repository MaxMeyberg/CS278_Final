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
          className="howto-modal-close modern-close-btn"
          onClick={onClose}
          aria-label="Close How to Play"
        >
          <span
            aria-hidden="true"
            style={{
              fontSize: "1.7em",
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &#10005;
          </span>
        </button>
        <h2>💸 How to Play</h2>
        <div className="howto-description">
          <div className="howto-intro">
            <p>
              <strong>Welcome to the Money Game!</strong> A strategic
              multiplayer game about cooperation, trust, and smart decisions.
            </p>
          </div>

          <div className="howto-steps">
            <div className="howto-step">
              <div className="step-icon">💰</div>
              <div className="step-content">
                <h3>Get Money Each Round</h3>
                <p>
                  Everyone starts with <strong>100 points</strong> per round for
                  3 rounds. Goal: reach <strong>1000 points</strong>!
                </p>
              </div>
            </div>

            <div className="howto-step">
              <div className="step-icon">🎁</div>
              <div className="step-content">
                <h3>Donate & Get Tripled</h3>
                <p>
                  Donate to other players. Any donations you receive are{" "}
                  <strong>tripled</strong>! 💫
                </p>
              </div>
            </div>

            <div className="howto-step">
              <div className="step-icon">🤝</div>
              <div className="step-content">
                <h3>Work Together</h3>
                <p>
                  No one knows others' money. Build trust and cooperate—or
                  everyone loses!
                </p>
              </div>
            </div>

            <div className="howto-step">
              <div className="step-icon">💬</div>
              <div className="step-content">
                <h3>Send Messages</h3>
                <p>
                  Include a message with donations to communicate, strategize,
                  or bluff.
                </p>
              </div>
            </div>
          </div>

          <div className="howto-goal">
            <div className="goal-box">
              <span className="goal-icon">🏆</span>
              <div className="goal-text">
                <strong>Win Together:</strong> Help everyone reach 1000 points
                through smart cooperation and trust!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
