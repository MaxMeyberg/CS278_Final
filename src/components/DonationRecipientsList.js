import React, { useState } from "react";

function DonationRecipientsList({
  recipients = [],
  currentDonations = {},
  handleDonationChange,
  maxInitialDisplay = 1,
  maxAmount = 0,
}) {
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);

  if (!recipients || recipients.length === 0) {
    return (
      <div className="donation-interface">
        <h3 className="box-header">Donate to Others (Gets Tripled!)</h3>
        <p style={{ padding: "12px", color: "var(--text-light)" }}>
          No other players have joined yet. Donation options will appear once
          more players join the game.
        </p>
      </div>
    );
  }

  const initialRecipientsToDisplay = recipients.slice(0, maxInitialDisplay);
  const hasMoreRecipients = recipients.length > maxInitialDisplay;

  // Handler to close modal when clicking background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowRecipientsModal(false);
    }
  };

  return (
    <div className="donation-interface">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
        }}
      >
        <h4
          className="box-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
            color: "var(--primary-color)",
            textTransform: "uppercase",
          }}
        >
          <strong>Donate to Others (Gets Tripled!)</strong>
        </h4>
        <button
          className="button-link"
          onClick={() => setShowRecipientsModal(true)}
        >
          View All ({recipients.length})
        </button>
      </div>

      <div className="received-messages-table" style={{ padding: "12px" }}>
        <div className="received-messages-header">
          <div className="sender-col">Recipient</div>
          <div className="amount-col">Amount ($)</div>
          <div className="message-col">Message (Optional)</div>
        </div>
        <div className="received-messages-rows">
          {initialRecipientsToDisplay.map((player) => (
            <div className="received-message-row" key={player.name}>
              <div className="sender-col">
                <span className="recipient-name">{player.name}</span>
              </div>
              <div className="amount-col">
                <input
                  type="number"
                  min="0"
                  max={maxAmount}
                  value={currentDonations[player.name]?.amount || ""}
                  onChange={(e) =>
                    handleDonationChange(player.name, e.target.value)
                  }
                  className="donation-input amount-input"
                  placeholder="$0"
                />
              </div>
              <div className="message-col">
                <input
                  type="text"
                  value={currentDonations[player.name]?.message || ""}
                  onChange={(e) =>
                    handleDonationChange(
                      player.name,
                      currentDonations[player.name]?.amount || 0,
                      e.target.value
                    )
                  }
                  className="donation-input message-input"
                  placeholder="Add a message..."
                  maxLength={50}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipients Modal */}
      {showRecipientsModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content donation-recipients-modal">
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowRecipientsModal(false);
              }}
              aria-label="Close recipients"
            >
              &times;
            </button>
            <h2>All Recipients - Donate to Others</h2>
            <div
              className="received-messages-table"
              style={{ padding: "12px" }}
            >
              <div className="received-messages-header">
                <div className="sender-col">Recipient</div>
                <div className="amount-col">Amount ($)</div>
                <div className="message-col">Message (Optional)</div>
              </div>
              <div className="received-messages-rows">
                {recipients.map((player) => (
                  <div className="received-message-row" key={player.name}>
                    <div className="sender-col">
                      <span className="recipient-name">{player.name}</span>
                    </div>
                    <div className="amount-col">
                      <input
                        type="number"
                        min="0"
                        max={maxAmount}
                        value={currentDonations[player.name]?.amount || ""}
                        onChange={(e) =>
                          handleDonationChange(player.name, e.target.value)
                        }
                        className="donation-input amount-input"
                        placeholder="$0"
                      />
                    </div>
                    <div className="message-col">
                      <input
                        type="text"
                        value={currentDonations[player.name]?.message || ""}
                        onChange={(e) =>
                          handleDonationChange(
                            player.name,
                            currentDonations[player.name]?.amount || 0,
                            e.target.value
                          )
                        }
                        className="donation-input message-input"
                        placeholder="Add a message..."
                        maxLength={50}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationRecipientsList;
