import React, { useState } from "react";

export default function SetupScreen({
  handleCreateGame,
  handleJoinGame,
  loading,
  error,
  joinMode,
  setJoinMode,
}) {
  const [localName, setLocalName] = useState("");
  const [localGameId, setLocalGameId] = useState("");

  return (
    <div className="setup-section">
      <h1>Money Game</h1>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="Your name"
          className="form-group-input setup-input"
          style={{ marginBottom: 28, fontSize: 24, height: 56, width: "100%" }}
        />
        {joinMode ? (
          <>
            <input
              value={localGameId}
              onChange={(e) => setLocalGameId(e.target.value.toUpperCase())}
              placeholder="Game code"
              maxLength={6}
              className="form-group-input setup-input"
              style={{
                marginBottom: 28,
                fontSize: 24,
                height: 56,
                width: "100%",
              }}
            />
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <button
                onClick={() => setJoinMode(false)}
                disabled={loading}
                className="button-secondary button-full-width"
                style={{ height: 56, fontSize: 22 }}
              >
                Back
              </button>
              <button
                onClick={() => handleJoinGame(localName, localGameId)}
                disabled={!localName.trim() || !localGameId.trim() || loading}
                className="button-primary button-full-width"
                style={{ height: 56, fontSize: 22 }}
              >
                {loading ? "Joining…" : "Join"}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => handleCreateGame(localName)}
              disabled={!localName.trim() || loading}
              className="button-secondary button-full-width"
              style={{ height: 64, fontSize: 26, marginBottom: 18 }}
            >
              {loading ? "Creating…" : "Create game"}
            </button>
            <button
              onClick={() => setJoinMode(true)}
              disabled={loading}
              className="button-primary button-full-width"
              style={{ height: 64, fontSize: 26 }}
            >
              Join existing game
            </button>
          </>
        )}
        {error && (
          <div
            className="error-message"
            style={{ marginTop: 18, fontSize: 18, textAlign: "center" }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
