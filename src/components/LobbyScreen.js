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

  // Add a dark mode style block for the islands
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const islandBg = isDark ? "rgba(255,255,255,0.04)" : "var(--background-alt)";
  const islandBorder = isDark
    ? "1.5px solid #353849"
    : "1.5px solid var(--border-color)";
  const islandShadow = isDark
    ? "0 4px 24px 0 rgba(0,0,0,0.22)"
    : "0 2px 12px 0 rgba(44,62,80,0.07)";

  return (
    <div
      className="lobby-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 0,
      }}
    >
      <div
        style={{ fontSize: 38, marginBottom: 8, color: "var(--accent-color)" }}
      >
        🎲
      </div>
      <h1 style={{ marginBottom: 0 }}>Game Lobby</h1>
      {/* Code Island */}
      <div
        style={{
          background: islandBg,
          borderRadius: 18,
          boxShadow: islandShadow,
          border: islandBorder,
          padding: "22px 18px 14px 18px",
          width: "100%",
          maxWidth: 340,
          margin: "28px 0 18px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 17,
            color: "var(--text-light)",
            letterSpacing: 1,
          }}
        >
          Code:
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: 26,
            color: "var(--primary-color)",
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          {joinedGameId}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            margin: "0 auto 10px auto",
            width: 50,
          }}
        />
        <p
          style={{
            color: "var(--text-light)",
            margin: 0,
            fontSize: 15,
            textAlign: "center",
          }}
        >
          Share this code with others to join!
        </p>
      </div>
      {/* Players Island */}
      <div
        style={{
          background: islandBg,
          borderRadius: 18,
          boxShadow: islandShadow,
          border: islandBorder,
          padding: "18px 18px 10px 18px",
          width: "100%",
          maxWidth: 340,
          margin: "0 0 18px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {error && (
          <div className="error-message" style={{ marginBottom: 10 }}>
            {error}
          </div>
        )}
        <PlayersList
          players={gameData?.players}
          currentPlayerName={playerName}
          maxInitialDisplay={2}
        />
      </div>
      {/* Action Button Island */}
      <div
        style={{
          background: islandBg,
          borderRadius: 18,
          boxShadow: islandShadow,
          border: islandBorder,
          padding: "18px 18px 10px 18px",
          width: "100%",
          maxWidth: 340,
          margin: "0 0 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {isHost && (
          <button
            className="button-primary button-full-width"
            onClick={handleStartGame}
            disabled={loading || playerCount < 2}
            style={{ fontSize: 22, height: 56 }}
          >
            {loading
              ? "Starting..."
              : playerCount < 2
              ? "Need at least 2 players"
              : "Start Game"}
          </button>
        )}
        {!isHost && gameData?.status === "waiting" && (
          <p className="waiting-message" style={{ marginTop: 10 }}>
            Waiting for the host ({gameData?.host}) to start the game...
          </p>
        )}
      </div>
    </div>
  );
}

export default LobbyScreen;
