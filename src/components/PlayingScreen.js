import React from "react";

// Helper function to get the current player object (can be moved or kept here)
const getPlayerObject = (gameData, playerName) => {
  return gameData
    ? Object.values(gameData.players).find((p) => p.name === playerName)
    : null;
};

function PlayingScreen({
  gameData,
  playerName,
  error,
  loading,
  currentDonations,
  handleDonationChange,
  calculateTotalDonations,
  handleSubmitDonations,
  handleProcessDonations,
  getReceivedDonations, // Pass the helper function as a prop
}) {
  const playerObj = getPlayerObject(gameData, playerName);
  const day = gameData?.day || 1;

  // Defensive check if player data is somehow missing
  if (!playerObj) {
    return (
      <div className="playing-container error-state">
        <div className="error-message">
          Player data not found. Please refresh or rejoin the game.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="button-secondary"
        >
          Refresh Game
        </button>
      </div>
    );
  }

  // === WAITING VIEW (Player has submitted donations) ===
  if (playerObj.ready) {
    return (
      <div className="playing-container waiting-view">
        {" "}
        {/* Add specific class */}
        <h1>Day {day} - Waiting for Others</h1>
        <div className="waiting-screen">
          {" "}
          {/* Re-use existing class for styling */}
          <p>You've submitted your donations. Waiting for other players...</p>
          {/* Your Donations Summary */}
          <div className="donations-summary">
            <h3>Your Donations:</h3>
            {Object.entries(currentDonations).map(
              ([recipient, data]) =>
                data.amount > 0 && (
                  <div key={recipient} className="donation-summary-item">
                    <p>
                      To {recipient}: ${data.amount}
                    </p>
                    {data.message && (
                      <p className="donation-message">"{data.message}"</p>
                    )}
                  </div>
                )
            )}
            {Object.values(currentDonations).every((d) => d.amount === 0) && (
              <p>
                <i>No donations made this round.</i>
              </p>
            )}
          </div>
          {/* Player Readiness Status - Updated Structure */}
          <div className="player-status-section">
            {" "}
            {/* Added wrapper */}
            <h4>Player Status:</h4>
            <div className="player-status-list">
              {Object.values(gameData.players).map((player) => (
                <div
                  key={player.name}
                  className={`player-status ${
                    player.ready ? "ready" : "pending"
                  }`}
                >
                  <span className="player-name">{player.name}:</span>{" "}
                  {/* Separate name */}
                  <span className="status-text">
                    {player.ready ? "Ready ✓" : "Deciding..."}
                  </span>{" "}
                  {/* Separate status */}
                </div>
              ))}
            </div>
          </div>
          {/* Process Donations Button (Host Only) */}
          {gameData.host === playerName &&
            Object.values(gameData.players).every((p) => p.ready) && (
              <button
                className="button-primary process-button button-full-width"
                onClick={handleProcessDonations}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : "Everyone is ready! Process Donations"}
              </button>
            )}
        </div>
      </div>
    );
  }

  // === DONATING VIEW (Player needs to make donations) ===
  const remainingBalance = playerObj.money - calculateTotalDonations();
  const otherPlayers = Object.values(gameData.players).filter(
    (p) => p.name !== playerName
  );

  return (
    <div className="playing-container donating-view">
      {" "}
      {/* Add specific class */}
      <div className="game-header">
        <h1>Money Game - Day {day}/3</h1>
        <div className="player-turn-indicator">{playerName}'s Turn</div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {/* Player Info Box */}
      <div className="player-info">
        <h2>{playerName}</h2>
        <p>Your Balance: ${playerObj.money}</p>
        <p>
          Remaining After Donations:{" "}
          <span
            style={{
              fontWeight: "bold",
              color:
                remainingBalance < 0
                  ? "var(--danger-text)"
                  : "var(--success-text)",
            }}
          >
            ${remainingBalance}
          </span>
        </p>
      </div>
      {/* Received Donations Section */}
      {day > 1 && gameData.donations && gameData.donations[day - 1] && (
        <div className="received-donations">
          <h3>Received Donations (Previous Day)</h3>
          <div className="received-donations-list">
            {getReceivedDonations(gameData, day - 1, playerName).map(
              (donation, index) => (
                <div key={index} className="received-donation-item">
                  <p>
                    From {donation.from}: ${donation.amount} (doubled to $
                    {donation.amount * 2})
                  </p>
                  {donation.message && (
                    <p className="received-message">"{donation.message}"</p>
                  )}
                </div>
              )
            )}
            {getReceivedDonations(gameData, day - 1, playerName).length ===
              0 && (
              <p>
                <i>No donations received last round.</i>
              </p>
            )}
          </div>
        </div>
      )}
      {/* Donation Interface - Redesigned */}
      <div className="donation-interface">
        <h3>Donate to Others (Gets Doubled!)</h3>
        <div className="donation-table">
          {" "}
          {/* Use divs for table-like structure */}
          <div className="donation-table-header">
            <div className="recipient-col">Recipient</div>
            <div className="amount-col">Amount ($)</div>
            <div className="message-col">Message (Optional)</div>
          </div>
          {otherPlayers.map((player) => (
            <div key={player.name} className="donation-row">
              <div className="recipient-col">
                <span className="recipient-name">{player.name}</span>
                <span className="multiplier">2×</span>
              </div>
              <div className="amount-col">
                <input
                  type="number"
                  min="0"
                  max={playerObj.money} // Max possible donation
                  value={currentDonations[player.name]?.amount || ""} // Use empty string for placeholder
                  onChange={(e) =>
                    handleDonationChange(player.name, e.target.value)
                  } // Pass only amount
                  className="donation-input amount-input"
                  placeholder="0"
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
                  } // Pass amount AND message
                  className="donation-input message-input"
                  placeholder="Add a message..."
                  maxLength={50} // Keep max length
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Submit Button */}
      <button
        className="button-primary submit-button button-full-width"
        onClick={handleSubmitDonations}
        disabled={loading || remainingBalance < 0}
      >
        {loading ? "Submitting..." : "Submit Donations for Day " + day}
      </button>
    </div>
  );
}

export default PlayingScreen;
