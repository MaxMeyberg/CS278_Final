import React, { useState } from "react";

function ReceivedMessagesList({ messages = [], maxInitialDisplay = 1 }) {
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  if (!messages || messages.length === 0) {
    return (
      <div className="received-messages">
        <h4 className="box-header">Received Messages (Previous Round)</h4>
        <p className="received-message-empty">
          No messages received last round.
        </p>
      </div>
    );
  }

  const initialMessagesToDisplay = messages.slice(0, maxInitialDisplay);
  const hasMoreMessages = messages.length > maxInitialDisplay;

  // Handler to close modal when clicking background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowMessagesModal(false);
    }
  };

  const MessageRow = ({ donation }) => (
    <div className="received-message-row">
      <div className="sender-col">
        <b>{donation.from}</b>
      </div>
      <div className="amount-col">
        <span className="received-message-amount">${donation.amount}</span>
      </div>
      <div className="message-col">
        {donation.message ? (
          <span className="received-message-text">"{donation.message}"</span>
        ) : (
          <span className="no-message">—</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="received-messages">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            fontSize: "1.15em",
          }}
        >
          <strong>Received Messages (Previous Round)</strong>
        </h4>
        {
          <button
            className="button-link"
            onClick={() => setShowMessagesModal(true)}
          >
            View All ({messages.length})
          </button>
        }
      </div>

      <div className="received-messages-table">
        <div className="received-messages-header">
          <div className="sender-col">From</div>
          <div className="amount-col">Amount ($)</div>
          <div className="message-col">Message</div>
        </div>
        <div className="received-messages-rows">
          {initialMessagesToDisplay.map((donation, idx) => (
            <MessageRow key={idx} donation={donation} />
          ))}
        </div>
      </div>

      {/* Messages Modal */}
      {showMessagesModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content received-messages-modal">
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMessagesModal(false);
              }}
              aria-label="Close messages"
            >
              &times;
            </button>
            <h2>All Received Messages (Previous Round)</h2>
            <div className="received-messages-table">
              <div className="received-messages-header">
                <div className="sender-col">From</div>
                <div className="amount-col">Amount ($)</div>
                <div className="message-col">Message</div>
              </div>
              <div className="received-messages-rows">
                {messages.map((donation, idx) => (
                  <MessageRow key={idx} donation={donation} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceivedMessagesList;
