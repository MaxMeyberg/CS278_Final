import React, { useState } from "react";

function PlayersList({ players, currentPlayerName, maxInitialDisplay = 2 }) {
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  if (!players || Object.keys(players).length === 0) {
    return <p className="waiting-message">Waiting for players...</p>;
  }

  const allPlayers = Object.entries(players);
  const initialPlayersToDisplay = allPlayers.slice(0, maxInitialDisplay);
  const hasMorePlayers = allPlayers.length > maxInitialDisplay;

  // Handler to close modal when clicking background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPlayersModal(false);
    }
  };

  const PlayerItem = ({ playerKey, player, isModal = false }) => (
    <li
      key={playerKey}
      className={`player-item ${
        player.name === currentPlayerName ? "current-player" : ""
      }`}
    >
      <span className="player-name">{player.name}</span>
      <span className="player-tags">
        {player.isHost && <span className="host-tag">Host</span>}
        {player.name === currentPlayerName && (
          <span className="you-tag">You</span>
        )}
      </span>
    </li>
  );

  return (
    <div className="players-list-container">
      <div className="players-list-header">
        <h3>Players ({allPlayers.length})</h3>
        {hasMorePlayers && (
          <button
            className="button-link"
            onClick={() => setShowPlayersModal(true)}
          >
            View All ({allPlayers.length})
          </button>
        )}
      </div>

      <ul className="players-list">
        {initialPlayersToDisplay.map(([key, player]) => (
          <PlayerItem key={key} playerKey={key} player={player} />
        ))}
      </ul>

      {/* Players Modal */}
      {showPlayersModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content players-modal">
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowPlayersModal(false);
              }}
              aria-label="Close players list"
            >
              &times;
            </button>
            <h2>All Players ({allPlayers.length})</h2>
            <ul className="players-list players-modal-list">
              {allPlayers.map(([key, player]) => (
                <PlayerItem
                  key={key}
                  playerKey={key}
                  player={player}
                  isModal={true}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayersList;
