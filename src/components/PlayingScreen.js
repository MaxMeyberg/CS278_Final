import React, { useState } from "react";
import PlayerStatusList from "./PlayerStatusList";
import ReceivedMessagesList from "./ReceivedMessagesList";
import DonationRecipientsList from "./DonationRecipientsList";

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

  // DEBUG LOGS
  console.log("[PlayingScreen] Rendering for Day:", day);
  console.log("[PlayingScreen] gameData.donations:", gameData?.donations);
  if (day > 1) {
    const prevDayKey = `day${day - 1}`;
    console.log(
      "[PlayingScreen] Looking for donations from prevDayKey:",
      prevDayKey
    );
    console.log(
      "[PlayingScreen] gameData.donations[prevDayKey]:",
      gameData?.donations?.[prevDayKey]
    );
    const receivedLastRound = getReceivedDonations(
      gameData,
      day - 1,
      playerName
    );
    console.log(
      "[PlayingScreen] getReceivedDonations for prev round:",
      receivedLastRound
    );
    const sumReceived = receivedLastRound.reduce(
      (sum, d) => sum + d.amount * 3,
      0
    );
    console.log(
      "[PlayingScreen] Sum of (tripled) received donations for prev round:",
      sumReceived
    );
  }
  // END DEBUG LOGS

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
        <h1>Day {day} - Waiting for Others</h1>
        <div className="waiting-screen">
          <p>You've submitted your donations. Waiting for other players...</p>
          {/* Player Readiness Status */}
          <PlayerStatusList players={gameData.players} maxInitialDisplay={2} />
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

  // Logic for received messages
  const MAX_INITIAL_MESSAGES = 1;
  const allReceivedDonations =
    day > 1
      ? getReceivedDonations(gameData, day - 1, playerName)
          .slice()
          .sort((a, b) => b.amount - a.amount)
      : [];
  const initialMessagesToDisplay = allReceivedDonations.slice(
    0,
    MAX_INITIAL_MESSAGES
  );
  const hasMoreMessages = allReceivedDonations.length > MAX_INITIAL_MESSAGES;

  // DEBUG: Log the received messages logic
  console.log("[PlayingScreen] DEBUG - Received Messages Logic:");
  console.log("  - allReceivedDonations.length:", allReceivedDonations.length);
  console.log(
    "  - MAX_INITIAL_MESSAGES (top message only):",
    MAX_INITIAL_MESSAGES
  );
  console.log("  - hasMoreMessages:", hasMoreMessages);
  console.log(
    "  - initialMessagesToDisplay.length:",
    initialMessagesToDisplay.length
  );
  console.log(
    "  - Top message (highest donation):",
    allReceivedDonations[0] || "None"
  );
  console.log("  - allReceivedDonations:", allReceivedDonations);

  // Logic for donation recipients
  const MAX_INITIAL_RECIPIENTS = 2;
  const initialRecipientsToDisplay = otherPlayers.slice(
    0,
    MAX_INITIAL_RECIPIENTS
  );
  const hasMoreRecipients = otherPlayers.length > MAX_INITIAL_RECIPIENTS;

  // DEBUG: Log the donation players logic
  console.log("[PlayingScreen] DEBUG - Donation Players Logic:");
  console.log("  - otherPlayers.length:", otherPlayers.length);
  console.log("  - MAX_INITIAL_RECIPIENTS:", MAX_INITIAL_RECIPIENTS);
  console.log("  - hasMoreRecipients:", hasMoreRecipients);

  return (
    <div className="playing-container donating-view">
      <div className="game-header">
        <h1>Money Game - Day {day}/3</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      {/* Player Info Box */}
      <div className="player-info">
        <h2 className="box-header">{playerName}</h2>
        <div className="player-stats">
          <p>
            Your Balance: <span className="value">${playerObj.money}</span>
          </p>
          <p>
            Remaining After Donations:{" "}
            <span
              className={`value ${
                remainingBalance < 0 ? "remaining-balance negative" : ""
              }`}
            >
              ${remainingBalance}
            </span>
          </p>
        </div>
      </div>
      {/* Received Messages Section */}
      {day > 1 && (
        <ReceivedMessagesList
          messages={allReceivedDonations}
          maxInitialDisplay={1}
        />
      )}
      {/* Donation Interface */}
      <DonationRecipientsList
        recipients={otherPlayers}
        currentDonations={currentDonations}
        handleDonationChange={handleDonationChange}
        maxInitialDisplay={1}
        maxAmount={playerObj.money}
        isFirstRound={day === 1}
      />

      {/* Submit Box - Separate from donation interface */}
      <div className="submit-box">
        <button
          className="button-primary submit-button button-full-width"
          onClick={handleSubmitDonations}
          disabled={loading || remainingBalance < 0}
        >
          {loading ? "Submitting..." : `Submit Donations for Day ${day}`}
        </button>
      </div>
    </div>
  );
}

export default PlayingScreen;
