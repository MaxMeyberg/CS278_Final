import React, { useState, useEffect } from "react";
import {
  createGame,
  joinGame,
  listenToGame,
  startGame,
  submitDonations,
  processDonations,
  testAddPlayer,
  testFirebaseConnection,
  improvedTestAddPlayer,
  debugDatabase,
} from "./firebase";
import { ref, set, get, getDatabase } from "firebase/database";
import "./App.css";

// Import the new component
import SetupScreen from "./components/SetupScreen";
import LobbyScreen from "./components/LobbyScreen";
import PlayingScreen from "./components/PlayingScreen";
import HowToPlayModal from "./components/HowToPlayModal";

function App() {
  // Game state
  const [playerName, setPlayerName] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  const [joinedGameId, setJoinedGameId] = useState("");
  const [gameData, setGameData] = useState(null);
  const [gameState, setGameState] = useState("setup"); // setup, lobby, playing, gameover
  const [error, setError] = useState(null);
  const [currentDonations, setCurrentDonations] = useState({});
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState(false);
  const [currentMessages, setCurrentMessages] = useState({});
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Replace with this simpler filter implementation
  const FILTERED_WORDS = [
    "ass",
    "React",
    "React Native",
    "Swift",
    "CS 103",
    "CS 221",
    "CS 278",
    "fuck",
    "bitch",
    "pussy",
    // Add more words as needed
  ];

  const filterMessage = (message) => {
    if (!message) return "";

    let filteredMessage = message;
    FILTERED_WORDS.forEach((word) => {
      // Case insensitive replacement
      const regex = new RegExp(word, "gi");
      filteredMessage = filteredMessage.replace(regex, "*".repeat(word.length));
    });

    return filteredMessage;
  };

  // Listen for game updates
  useEffect(() => {
    if (!joinedGameId) return;

    console.log(`Setting up listener for joined game: ${joinedGameId}`);

    let previousPlayerCount = 0;

    const unsubscribe = listenToGame(joinedGameId, (data) => {
      if (!data) {
        setError("Game not found");
        return;
      }

      // Clear any previous errors when game data is received
      setError(null);
      setGameData(data);

      // Just log new players joining - this is important for debugging
      const currentPlayerCount = data.players
        ? Object.keys(data.players).length
        : 0;
      if (currentPlayerCount > previousPlayerCount) {
        console.log(
          `${currentPlayerCount - previousPlayerCount} new player(s) joined!`
        );
      }
      previousPlayerCount = currentPlayerCount;

      // Update game state based on game data
      if (data.status === "waiting") {
        setGameState("lobby");
      } else if (data.status === "active") {
        setGameState("playing");
      } else if (data.status === "completed") {
        setGameState("gameover");
      }
    });

    return () => unsubscribe();
  }, [joinedGameId]);

  // Initialize donations when entering game
  useEffect(() => {
    if (gameState === "playing" && gameData && playerName) {
      // Find the player object by name instead of using the key directly
      const playerObj = Object.values(gameData.players).find(
        (p) => p.name === playerName
      );

      if (playerObj && !playerObj.ready) {
        const newDonations = {};

        Object.values(gameData.players).forEach((player) => {
          if (player.name !== playerName) {
            newDonations[player.name] = { amount: 0, message: "" };
          }
        });

        setCurrentDonations(newDonations);
      }
    }
  }, [gameState, gameData, playerName]);

  // Create a new game
  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a random 6-character game ID
      const newGameId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const success = await createGame(newGameId, playerName);
      if (success) {
        setJoinedGameId(newGameId);
      } else {
        setError("Failed to create game");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Join an existing game
  const handleJoinGame = async () => {
    console.log("🔴🔴🔴 handleJoinGame called");
    console.log("🔴 Type of joinGame:", typeof joinGame);
    console.log("🔴 Current state:", { playerName, gameIdInput });

    if (!playerName.trim()) {
      console.log("❌ DEBUG: Join aborted - empty player name");
      setError("Please enter your name");
      return;
    }

    if (!gameIdInput.trim()) {
      setError("Please enter a game code");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("🔍 DEBUG: Join attempt starting - calling joinGame function");

    try {
      const normalizedGameId = gameIdInput.trim().toUpperCase();
      console.log(`🔍 DEBUG: Normalized game ID: ${normalizedGameId}`);

      // Add this line to check if the function is being imported correctly
      console.log(
        "🔍 DEBUG: joinGame function exists:",
        typeof joinGame === "function"
      );

      // This line should be calling the Firebase joinGame function
      console.log("🔴 About to call Firebase joinGame function");
      const result = await joinGame(normalizedGameId, playerName);
      console.log("🔴 Firebase joinGame returned:", result);

      if (result.success) {
        console.log(`🔍 DEBUG: Join successful, setting joinedGameId`);
        // Only set the joined game ID AFTER successfully joining
        setJoinedGameId(normalizedGameId);
      } else {
        console.log(`🔍 DEBUG: Join failed with message: ${result.message}`);
        setError(result.message || "Failed to join game");
      }
    } catch (error) {
      console.error("🔍 DEBUG: Exception in handleJoinGame:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log("🔍 DEBUG: handleJoinGame completed");
    }
  };

  // Start the game (host only)
  const handleStartGame = async () => {
    if (!gameData || Object.keys(gameData.players).length < 2) {
      setError("Need at least 2 players to start");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await startGame(joinedGameId);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle donation changes
  const handleDonationChange = (recipientName, amount, message = null) => {
    const numAmount = amount === "" ? 0 : Math.max(0, Number(amount));

    setCurrentDonations((prev) => ({
      ...prev,
      [recipientName]: {
        amount: numAmount,
        message:
          message !== null
            ? filterMessage(message)
            : prev[recipientName]?.message || "",
      },
    }));
  };

  // Calculate total donations
  const calculateTotalDonations = () => {
    return Object.values(currentDonations).reduce(
      (sum, amount) => sum + Number(amount?.amount || 0),
      0
    );
  };

  // Submit donations
  const handleSubmitDonations = async () => {
    if (!gameData || !playerName) return;

    // Find player by name
    const playerObj = Object.values(gameData.players).find(
      (p) => p.name === playerName
    );
    if (!playerObj) {
      console.error("Player not found:", playerName);
      console.log("Available players:", gameData.players);
      return;
    }

    const playerMoney = playerObj.money;
    const total = calculateTotalDonations();

    if (total > playerMoney) {
      setError("You don't have enough money for these donations");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitDonations(
        joinedGameId,
        playerName,
        currentDonations,
        gameData.day
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Process all donations (host only)
  const handleProcessDonations = async () => {
    setLoading(true);
    setError(null);

    try {
      await processDonations(joinedGameId);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clean up the addTestPlayer function
  const addTestPlayer = async () => {
    if (!joinedGameId) {
      setError("No game ID available");
      return;
    }

    try {
      setLoading(true);
      const testName = "Test" + Math.floor(Math.random() * 1000);
      const db = getDatabase();

      // Use a prefixed key
      const playerKey = `player_${testName}`;

      console.log(
        `Directly adding test player ${testName} to game ${joinedGameId}`
      );

      await set(ref(db, `games/${joinedGameId}/players/${playerKey}`), {
        name: testName,
        money: 100,
        isHost: false,
        ready: false,
      });

      console.log("Test player added successfully");
      setError(null);
    } catch (error) {
      console.error("Error adding test player:", error);
      setError("Failed to add test player: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update your debugDatabase function
  const debugDatabase = async () => {
    try {
      console.log("🔍 DEBUG DATABASE: Starting database debug...");
      const db = getDatabase();

      // Check if the game exists
      const gameRef = ref(db, `games/${joinedGameId}`);
      const snapshot = await get(gameRef);

      if (snapshot.exists()) {
        console.log("✅ GAME EXISTS:", snapshot.val());
        console.log("Players:", snapshot.val().players || "No players");

        // Check players specifically
        if (snapshot.val().players) {
          console.log(
            "Player count:",
            Object.keys(snapshot.val().players).length
          );
          console.log("Player details:", snapshot.val().players);
        } else {
          console.log("❌ No players found in the game");
        }
      } else {
        console.log("❌ GAME NOT FOUND");

        // Check what games exist
        const allGamesRef = ref(db, "games");
        const allGames = await get(allGamesRef);
        console.log("Available games:", allGames.val() || "None");
      }
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  // Add this function
  const testJoinProcess = async () => {
    try {
      console.log("🧪 TESTING JOIN PROCESS");
      if (!joinedGameId) {
        console.error("❌ No game ID to test with");
        return;
      }

      const testPlayerName = "TestJoin" + Math.floor(Math.random() * 1000);
      console.log(`🧪 Testing join with player: ${testPlayerName}`);

      // First test with testAddPlayer to see if direct database writes work
      console.log("Step 1: Testing direct database write");
      const directAddSuccess = await testAddPlayer(
        joinedGameId,
        testPlayerName
      );
      console.log(`Direct add ${directAddSuccess ? "succeeded" : "failed"}`);

      // Then test with joinGame to check if the normal flow works
      console.log("Step 2: Testing normal join flow");
      const joinResult = await joinGame(
        joinedGameId,
        "JoinTest" + Math.floor(Math.random() * 1000)
      );
      console.log("Join result:", joinResult);

      // Check the database to confirm
      console.log("Step 3: Verifying database state");
      await debugDatabase();
    } catch (error) {
      console.error("Test join process error:", error);
    }
  };

  // Make sure getReceivedDonations is defined here or imported if needed
  // Add this function near your other helper functions if not already present
  const getReceivedDonations = (gameData, day, playerName) => {
    const dayKey = `day${day}`; // Assuming keys are day1, day2 etc.
    if (!gameData?.donations?.[dayKey]) return [];

    const received = [];
    Object.entries(gameData.donations[dayKey]).forEach(
      ([donorName, donations]) => {
        // Check if this donor donated to the current player
        const donationToPlayer = Object.entries(donations).find(
          ([recipientName, data]) => recipientName === playerName
        );

        if (
          donationToPlayer &&
          donationToPlayer[1] &&
          donationToPlayer[1].amount > 0
        ) {
          received.push({
            from: donorName,
            amount: donationToPlayer[1].amount,
            message: donationToPlayer[1].message || "",
          });
        }
      }
    );
    return received;
  };

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 1200);
    const hideTimer = setTimeout(() => setShowSplash(false), 1500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // RENDER FUNCTIONS

  if (showSplash) {
    return (
      <div className={`splash-overlay${splashFading ? " splash-fadeout" : ""}`}>
        <div className="splash-content">
          <div className="splash-logo">💸</div>
          <h1 className="splash-title">Money Game</h1>
          <p className="splash-tagline">Trust. Bluff. Win Together.</p>
        </div>
      </div>
    );
  }

  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="game-container">
        {/* Floating How to Play button, always visible */}
        <button
          className="howto-float-btn"
          onClick={() => setShowHowToPlay(true)}
          aria-label="How to Play"
          type="button"
        >
          <span className="howto-float-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="#fff"
              />
              <rect
                x="13.1"
                y="12"
                width="1.8"
                height="8"
                rx="0.9"
                fill="var(--primary-color)"
              />
              <rect
                x="13.1"
                y="7.2"
                width="1.8"
                height="1.8"
                rx="0.9"
                fill="var(--primary-color)"
              />
            </svg>
          </span>
        </button>
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <SetupScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          gameIdInput={gameIdInput}
          setGameIdInput={setGameIdInput}
          handleCreateGame={handleCreateGame}
          handleJoinGame={handleJoinGame}
          loading={loading}
          error={error}
          joinMode={joinMode}
          setJoinMode={setJoinMode}
        />
      </div>
    );
  }

  // Lobby screen
  if (gameState === "lobby") {
    return (
      <div className="game-container">
        {/* Floating How to Play button, always visible */}
        <button
          className="howto-float-btn"
          onClick={() => setShowHowToPlay(true)}
          aria-label="How to Play"
          type="button"
        >
          <span className="howto-float-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="#fff"
              />
              <rect
                x="13.1"
                y="12"
                width="1.8"
                height="8"
                rx="0.9"
                fill="var(--primary-color)"
              />
              <rect
                x="13.1"
                y="7.2"
                width="1.8"
                height="1.8"
                rx="0.9"
                fill="var(--primary-color)"
              />
            </svg>
          </span>
        </button>
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <LobbyScreen
          joinedGameId={joinedGameId}
          gameData={gameData}
          playerName={playerName}
          handleStartGame={handleStartGame}
          loading={loading}
          error={error}
          testAddPlayer={testAddPlayer}
          improvedTestAddPlayer={improvedTestAddPlayer}
          debugDatabase={debugDatabase}
        />
      </div>
    );
  }

  // Playing screen
  if (gameState === "playing") {
    return (
      <div className="game-container">
        {/* Floating How to Play button, always visible */}
        <button
          className="howto-float-btn"
          onClick={() => setShowHowToPlay(true)}
          aria-label="How to Play"
          type="button"
        >
          <span className="howto-float-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="#fff"
              />
              <rect
                x="13.1"
                y="12"
                width="1.8"
                height="8"
                rx="0.9"
                fill="var(--primary-color)"
              />
              <rect
                x="13.1"
                y="7.2"
                width="1.8"
                height="1.8"
                rx="0.9"
                fill="var(--primary-color)"
              />
            </svg>
          </span>
        </button>
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <PlayingScreen
          gameData={gameData}
          playerName={playerName}
          error={error}
          loading={loading}
          currentDonations={currentDonations}
          handleDonationChange={handleDonationChange}
          calculateTotalDonations={calculateTotalDonations}
          handleSubmitDonations={handleSubmitDonations}
          handleProcessDonations={handleProcessDonations}
          getReceivedDonations={getReceivedDonations}
        />
      </div>
    );
  }

  // Game over screen
  if (gameState === "gameover") {
    const allHaveEnough = Object.values(gameData.players).every(
      (p) => p.money >= 1000
    );

    return (
      <div className="game-container">
        <h1>{allHaveEnough ? "Victory!" : "Game Over"}</h1>

        <div className="game-result">
          <p>
            {allHaveEnough
              ? "Congratulations! Everyone reached the goal of $1000!"
              : "Not everyone reached the goal of $1000."}
          </p>

          <div className="final-results">
            {Object.entries(gameData.players).map(([name, player]) => (
              <div
                key={name}
                className={`player-result ${
                  player.money >= 1000 ? "success" : "failure"
                }`}
              >
                <h3>{player.name}</h3>
                <p>${player.money}</p>
                <p>
                  {player.money >= 1000 ? "✅ Goal reached" : "❌ Below goal"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          className="restart-button"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
    );
  }

  return <div className="game-container">Loading...</div>;
}

export default App;
