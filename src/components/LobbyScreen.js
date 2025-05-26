import React from "react";
import PlayersList from "./PlayersList";

function LobbyScreen({
  joinedGameId,
  gameData,
  playerName,
  handleStartGame,
  loading,
  error,
  // Debugging/Testing functions passed as props
  testAddPlayer,
  improvedTestAddPlayer,
  debugDatabase,
}) {
  const isHost = gameData?.host === playerName;
  const playerCount = gameData?.players
    ? Object.keys(gameData.players).length
    : 0;

  return (
    <div className="lobby-container">
      {" "}
      {/* Use a specific container class */}
      <h1>Game Lobby</h1>
      <h2>
        Code:{" "}
        <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
          {joinedGameId}
        </span>
      </h2>
      <p style={{ color: "var(--text-light)", marginBottom: "25px" }}>
        Share this code with others to join!
      </p>
      {error && <div className="error-message">{error}</div>}
      <PlayersList
        players={gameData?.players}
        currentPlayerName={playerName}
        maxInitialDisplay={2}
      />
      {/* {isHost && ( // Keep the overall comment for the section if desired, or remove */}
      {/* Bring back Start Game button */}
      {isHost && (
        <button
          className="button-primary button-full-width" // Use new classes
          onClick={handleStartGame}
          disabled={loading || playerCount < 2}
        >
          {loading
            ? "Starting..."
            : playerCount < 2
            ? "Need at least 2 players"
            : "Start Game"}
        </button>
      )}
      {/* )} */}
      {!isHost && gameData?.status === "waiting" && (
        <p className="waiting-message">
          Waiting for the host ({gameData?.host}) to start the game...
        </p>
      )}
      {/* Debug Buttons remain hidden */}
      {/* {isHost && ( ... debug tools JSX ... )} */}
      {/* Optional: Raw Game Status Display for Debug */}
      {/* <div style={{marginTop: '20px', padding: '15px', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)'}}>
         <h4>Game Status</h4>
         <pre style={{fontSize: '0.8em', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
           {JSON.stringify(gameData, null, 2)}
         </pre>
       </div> */}
    </div>
  );
}

export default LobbyScreen;
