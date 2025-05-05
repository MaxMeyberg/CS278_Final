import React from "react";

function SetupScreen({
  playerName,
  setPlayerName,
  gameIdInput,
  setGameIdInput,
  handleCreateGame,
  handleJoinGame,
  loading,
  error,
  joinMode,
  setJoinMode,
}) {
  return (
    <div className="game-container">
      {" "}
      {/* Keep game-container for overall layout? Or move to App? Let's keep for now */}
      <h1>Money Game</h1>
      {error && <div className="error-message">{error}</div>}
      {!joinMode ? (
        // Initial screen with create or join options
        <div className="setup-section">
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="input" // Use consistent class if defined globally
            />
          </div>

          <button
            className="button-primary button-full-width" // Use new button classes
            onClick={handleCreateGame}
            disabled={loading || !playerName.trim()}
          >
            {loading ? "Creating..." : "Create New Game"}
          </button>

          <div className="or-divider">OR</div>

          <button
            onClick={() => setJoinMode(true)}
            className="button-secondary button-full-width" // Use new button classes
            // Remove inline styles, rely on CSS classes
          >
            Join Existing Game
          </button>
        </div>
      ) : (
        // Join mode screen
        <div className="join-section">
          <h2>Join a Game</h2>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Game Code</label>
            <input
              type="text"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              placeholder="Enter game code"
              className="input"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={() => setJoinMode(false)}
              className="button-secondary" // Use new button classes
              style={{ flex: 1 }} // Keep flex for layout
            >
              Back
            </button>

            <button
              onClick={() => {
                console.log("🔴 BUTTON CLICKED: Join Game button was clicked!");
                console.log("🔴 Current state:", { playerName, gameIdInput });
                console.log("🔴 Calling handleJoinGame...");
                handleJoinGame();
              }}
              disabled={loading || !playerName.trim() || !gameIdInput.trim()}
              className="button-primary" // Use new button classes
              style={{ flex: 2 }} // Keep flex for layout
            >
              {loading ? "Joining..." : "Join Game"}
            </button>
          </div>

          {/* Removed the Debug Join button for cleaner UI, can be re-added if needed */}
          {/* <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => { ... }}
              style={{ backgroundColor: '#ff9800', color: 'white' }}
            >
              Debug Join (Test)
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default SetupScreen;
