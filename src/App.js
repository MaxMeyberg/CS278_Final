import React, { useRef, useState, useEffect } from "react";
import SetupScreen from "./components/SetupScreen";
import LobbyScreen from "./components/LobbyScreen";
import PlayingScreen from "./components/PlayingScreen";
import HowToPlayModal from "./components/HowToPlayModal";
import CornerButtons from "./components/CornerButtons";
import GameOverPlayersList from "./components/GameOverPlayersList";
import {
  createGame,
  joinGame,
  listenToGame,
  startGame,
  submitDonations,
  processDonations,
  testAddPlayer,
  improvedTestAddPlayer,
  debugDatabase,
} from "./firebase";
import { set, ref, getDatabase } from "firebase/database";
import "./styles/index.css";

export default function App() {
  const playerNameRef = useRef("");
  const [playerKey, setPlayerKey] = useState(null);
  const [joinedGameId, setJoinedGameId] = useState("");
  const [gameData, setGameData] = useState(null);
  const [gameState, setGameState] = useState("setup");
  const [currentDonations, setCurrentDonations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or default to false
    const savedTheme = localStorage.getItem("money-game-theme");
    const isDark = savedTheme === "dark";
    // Set the initial theme on the document
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    return isDark;
  });

  // Splash screen effect
  useEffect(() => {
    const a = setTimeout(() => setSplashFading(true), 1200);
    const b = setTimeout(() => setShowSplash(false), 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  // Show How to Play modal after splash screen finishes
  useEffect(() => {
    if (!showSplash) {
      // Show How to Play modal after splash screen disappears
      const timer = setTimeout(() => {
        setShowHowToPlay(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Listen to game data
  useEffect(() => {
    if (!joinedGameId) return;
    const unsub = listenToGame(joinedGameId, async (data) => {
      if (!data) return setError("Game not found");
      setGameData(data);
      setError(null);

      // If there is no host, go back to setup/menu
      const hasHost = Object.values(data.players || {}).some((p) => p.isHost);
      if (!hasHost) {
        setGameState("setup");
        setGameData(null);
        setJoinedGameId("");
        setPlayerKey(null);
        playerNameRef.current = "";
        setError("Host left the game. Returning to menu.");
        return;
      }

      // If only 1 player remains
      const playerEntries = Object.entries(data.players || {});
      const playerCount = playerEntries.length;
      if (playerCount === 1 && data.status !== "waiting") {
        const onlyPlayer = playerEntries[0][1];
        // If the only player left is the host, set status to 'waiting' and go to lobby
        if (onlyPlayer.isHost) {
          try {
            const db = getDatabase();
            await set(ref(db, `games/${joinedGameId}/status`), "waiting");
          } catch (e) {
            // Optionally log or handle error
          }
          setGameState("lobby");
        } else {
          // If the only player left is NOT the host (shouldn't happen, but for safety)
          setGameState("setup");
          setGameData(null);
          setJoinedGameId("");
          setPlayerKey(null);
          playerNameRef.current = "";
          setError("Not enough players. Returning to menu.");
        }
        return;
      }

      if (data.status === "waiting") setGameState("lobby");
      else if (data.status === "active") setGameState("playing");
      else if (data.status === "completed") setGameState("gameover");
    });
    return unsub;
  }, [joinedGameId]);

  // Clear donations when the day changes (new round)
  useEffect(() => {
    if (!gameData) return;
    setCurrentDonations({});
  }, [gameData?.day]);

  // Theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode((d) => {
      const next = !d;
      const theme = next ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("money-game-theme", theme);
      return next;
    });
  };

  // Create game
  const handleCreateGame = async (name) => {
    if (!name.trim()) return setError("Please enter your name");
    playerNameRef.current = name;
    setLoading(true);
    setError(null);
    try {
      const id = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { success, playerKey: pk } = await createGame(id, name);
      if (success) {
        setPlayerKey(pk);
        setJoinedGameId(id);
        setGameState("lobby");
      } else setError("Failed to create game");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Join game
  const handleJoinGame = async (name, code) => {
    if (!name.trim()) return setError("Please enter your name");
    if (!code.trim()) return setError("Please enter a game code");
    playerNameRef.current = name;
    setLoading(true);
    setError(null);
    try {
      const id = code.trim().toUpperCase();
      const res = await joinGame(id, name);
      if (res.success) {
        setPlayerKey(res.playerKey);
        setJoinedGameId(id);
        setGameState("lobby");
      } else setError(res.message || "Failed to join game");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Start game
  const handleStartGame = async () => {
    if (!gameData || Object.keys(gameData.players).length < 2)
      return setError("Need at least 2 players to start");
    setLoading(true);
    setError(null);
    try {
      await startGame(joinedGameId);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Donations logic
  const handleDonationChange = (to, amount, msg = null) => {
    const num = amount === "" ? 0 : Math.max(0, Number(amount));

    // If amount becomes 0, clear both amount and message
    if (num === 0) {
      setCurrentDonations((prev) => ({
        ...prev,
        [to]: {
          amount: 0,
          message: "",
        },
      }));
    } else {
      setCurrentDonations((prev) => ({
        ...prev,
        [to]: {
          amount: num,
          message: msg !== null ? msg : prev[to]?.message || "",
        },
      }));
    }
  };

  const calculateTotalDonations = () =>
    Object.values(currentDonations).reduce(
      (s, d) => s + Number(d.amount || 0),
      0
    );

  const handleSubmitDonations = async () => {
    if (!gameData || !playerNameRef.current) return;
    const me = Object.values(gameData.players).find(
      (p) => p.name === playerNameRef.current
    );
    if (!me) return setError("Player not found");
    if (calculateTotalDonations() > me.money)
      return setError("You don't have enough money");
    setLoading(true);
    setError(null);
    try {
      await submitDonations(
        joinedGameId,
        playerNameRef.current,
        currentDonations,
        gameData.day
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      await processDonations(joinedGameId);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Utility to get received donations for a player on a given day
  function getReceivedDonations(gameData, day, playerName) {
    const dayKey = `day${day}`;
    const donations = gameData?.donations?.[dayKey] || {};
    const received = [];
    Object.entries(donations).forEach(([donor, recips]) => {
      if (recips[playerName]) {
        const amount = recips[playerName].amount || 0;
        // Only include donations with amount > 0
        if (amount > 0) {
          received.push({
            from: donor,
            amount: amount,
            message: recips[playerName].message || "",
          });
        }
      }
    });
    return received;
  }

  // Splash
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
      <div
        className={`game-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
      >
        <CornerButtons
          isDarkMode={isDarkMode}
          onToggleTheme={handleThemeToggle}
          onInfoClick={() => setShowHowToPlay(true)}
        />
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <SetupScreen
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
      <div
        className={`game-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
      >
        <CornerButtons
          isDarkMode={isDarkMode}
          onToggleTheme={handleThemeToggle}
          onInfoClick={() => setShowHowToPlay(true)}
        />
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <LobbyScreen
          playerName={playerNameRef.current}
          joinedGameId={joinedGameId}
          gameData={gameData}
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
      <div
        className={`game-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
      >
        <CornerButtons
          isDarkMode={isDarkMode}
          onToggleTheme={handleThemeToggle}
          onInfoClick={() => setShowHowToPlay(true)}
        />
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <PlayingScreen
          playerName={playerNameRef.current}
          gameData={gameData}
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
      <div
        className={`game-container ${isDarkMode ? "dark-mode" : "light-mode"}`}
      >
        <CornerButtons
          isDarkMode={isDarkMode}
          onToggleTheme={handleThemeToggle}
          onInfoClick={() => setShowHowToPlay(true)}
        />
        <HowToPlayModal
          open={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
        />
        <h1 className="text-2xl font-bold mb-2">
          {allHaveEnough ? "Victory!" : "Game Over"}
        </h1>
        <p className="mb-4">
          {allHaveEnough
            ? "Congratulations! Everyone reached the goal of $1000!"
            : "Not everyone reached the goal of $1000."}
        </p>
        <GameOverPlayersList
          players={gameData.players}
          targetAmount={1000}
          maxInitialDisplay={2}
        />
        <button
          className="restart-button mt-6"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
    );
  }

  return <div>Loading…</div>;
}
