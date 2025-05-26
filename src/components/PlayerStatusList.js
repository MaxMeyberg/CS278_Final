import React, { useState } from "react";

function PlayerStatusList({ players, maxInitialDisplay = 2 }) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (!players || Object.keys(players).length === 0) {
    return <p>No players found.</p>;
  }

  const allPlayers = Object.values(players);
  const initialPlayersToDisplay = allPlayers.slice(0, maxInitialDisplay);
  const hasMorePlayers = allPlayers.length > maxInitialDisplay;

  // Handler to close modal when clicking background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowStatusModal(false);
    }
  };

  const PlayerStatusItem = ({ player, isModal = false }) => (
    <div
      key={player.name}
      className={`player-status ${player.ready ? "ready" : "pending"}`}
    >
      <span className="player-name">{player.name}:</span>
      <span className="status-text">
        {player.ready ? "Ready ✓" : "Deciding..."}
      </span>
    </div>
  );

  return (
    <div className="player-status-section">
      <div className="players-list-header">
        <h4>Player Status:</h4>
        {hasMorePlayers && (
          <button
            className="button-link"
            onClick={() => setShowStatusModal(true)}
          >
            View All ({allPlayers.length})
          </button>
        )}
      </div>

      <div className="player-status-list">
        {initialPlayersToDisplay.map((player) => (
          <PlayerStatusItem key={player.name} player={player} />
        ))}
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content player-status-modal">
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusModal(false);
              }}
              aria-label="Close player status"
            >
              &times;
            </button>
            <h2>All Player Statuses</h2>
            <div className="player-status-list">
              {allPlayers.map((player) => (
                <PlayerStatusItem
                  key={player.name}
                  player={player}
                  isModal={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerStatusList;
