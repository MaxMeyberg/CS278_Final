import React, { useState } from "react";

function GameOverPlayersList({
  players,
  targetAmount = 1000,
  maxInitialDisplay = 2,
}) {
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  if (!players || Object.keys(players).length === 0) {
    return <p>No players found.</p>;
  }

  const allPlayers = Object.entries(players);
  const initialPlayersToDisplay = allPlayers.slice(0, maxInitialDisplay);
  const hasMorePlayers = allPlayers.length > maxInitialDisplay;

  // Find the lowest player and amount
  const lowestPlayerEntry = allPlayers.reduce((min, entry) =>
    entry[1].money < min[1].money ? entry : min
  );
  const [lowestKey, lowestPlayer] = lowestPlayerEntry;

  // Handler to close modal when clicking background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPlayersModal(false);
    }
  };

  const PlayerResultItem = ({ playerKey, player, isModal = false }) => (
    <div
      key={playerKey}
      className={`player-result ${
        player.money >= targetAmount ? "success" : "failure"
      }`}
    >
      <h3>{player.name}</h3>
      <p>${player.money}</p>
      <p>
        {player.money >= targetAmount ? "✅ Goal reached" : "❌ Below goal"}
      </p>
    </div>
  );

  return (
    <div className="final-results-container">
      {/* Lowest player card display */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            color: "var(--primary-color)",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Lowest Player Result
        </h3>
        <div style={{ maxWidth: 340, width: "100%" }}>
          <div
            className={`player-result ${
              lowestPlayer.money >= targetAmount ? "success" : "failure"
            }`}
            style={{ margin: "0 auto", textAlign: "center" }}
          >
            <h3>{lowestPlayer.name}</h3>
            <p>${lowestPlayer.money}</p>
            <p>
              {lowestPlayer.money >= targetAmount
                ? "✅ Goal reached"
                : "❌ Below goal"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverPlayersList;
