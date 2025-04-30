import React, { useState, useEffect } from 'react';
import {
  createGame,
  joinGame,
  listenToGame,
  startGame,
  submitDonations,
  processDonations,
  testAddPlayer,
  testFirebaseConnection,
  improvedTestAddPlayer
} from './firebase';
import { ref, set, get, getDatabase } from 'firebase/database';
import './App.css';

function App() {
  // Game state
  const [playerName, setPlayerName] = useState('');
  const [gameIdInput, setGameIdInput] = useState('');
  const [joinedGameId, setJoinedGameId] = useState('');
  const [gameData, setGameData] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, lobby, playing, gameover
  const [error, setError] = useState(null);
  const [currentDonations, setCurrentDonations] = useState({});
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState(false);
  const [currentMessages, setCurrentMessages] = useState({});

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
      const currentPlayerCount = data.players ? Object.keys(data.players).length : 0;
      if (currentPlayerCount > previousPlayerCount) {
        console.log(`${currentPlayerCount - previousPlayerCount} new player(s) joined!`);
      }
      previousPlayerCount = currentPlayerCount;
      
      // Update game state based on game data
      if (data.status === 'waiting') {
        setGameState('lobby');
      } else if (data.status === 'active') {
        setGameState('playing');
      } else if (data.status === 'completed') {
        setGameState('gameover');
      }
    });
    
    return () => unsubscribe();
  }, [joinedGameId]);
  
  // Initialize donations when entering game
  useEffect(() => {
    if (gameState === 'playing' && gameData && playerName) {
      // Find the player object by name instead of using the key directly
      const playerObj = Object.values(gameData.players).find(p => p.name === playerName);
      
      if (playerObj && !playerObj.ready) {
        const newDonations = {};
        
        Object.values(gameData.players).forEach(player => {
          if (player.name !== playerName) {
            newDonations[player.name] = { amount: 0, message: '' };
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
      const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
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
      console.log("🔍 DEBUG: joinGame function exists:", typeof joinGame === 'function');
      
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
    const numAmount = amount === '' ? 0 : Math.max(0, Number(amount));
    
    setCurrentDonations(prev => ({
      ...prev,
      [recipientName]: {
        amount: numAmount,
        message: message !== null ? message : (prev[recipientName]?.message || '')
      }
    }));
  };
  
  // Calculate total donations
  const calculateTotalDonations = () => {
    return Object.values(currentDonations).reduce((sum, amount) => sum + Number(amount?.amount || 0), 0);
  };
  
  // Submit donations
  const handleSubmitDonations = async () => {
    if (!gameData || !playerName) return;
    
    // Find player by name
    const playerObj = Object.values(gameData.players).find(p => p.name === playerName);
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
      await submitDonations(joinedGameId, playerName, currentDonations, gameData.day);
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
      
      console.log(`Directly adding test player ${testName} to game ${joinedGameId}`);
      
      await set(ref(db, `games/${joinedGameId}/players/${playerKey}`), {
        name: testName,
        money: 100,
        isHost: false,
        ready: false
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
          console.log("Player count:", Object.keys(snapshot.val().players).length);
          console.log("Player details:", snapshot.val().players);
        } else {
          console.log("❌ No players found in the game");
        }
      } else {
        console.log("❌ GAME NOT FOUND");
        
        // Check what games exist
        const allGamesRef = ref(db, 'games');
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
      const directAddSuccess = await testAddPlayer(joinedGameId, testPlayerName);
      console.log(`Direct add ${directAddSuccess ? 'succeeded' : 'failed'}`);
      
      // Then test with joinGame to check if the normal flow works
      console.log("Step 2: Testing normal join flow");
      const joinResult = await joinGame(joinedGameId, "JoinTest" + Math.floor(Math.random() * 1000));
      console.log("Join result:", joinResult);
      
      // Check the database to confirm
      console.log("Step 3: Verifying database state");
      await debugDatabase();
    } catch (error) {
      console.error("Test join process error:", error);
    }
  };
  
  // Add this function near your other helper functions
  const getReceivedDonations = (gameData, day, playerName) => {
    if (!gameData?.donations?.[day]) return [];
    
    const received = [];
    Object.entries(gameData.donations[day]).forEach(([donorName, donations]) => {
      if (donations[playerName] && donations[playerName].amount > 0) {
        received.push({
          from: donorName,
          amount: donations[playerName].amount,
          message: donations[playerName].message
        });
      }
    });
    return received;
  };
  
  // RENDER FUNCTIONS
  
  // Setup screen
  if (gameState === 'setup') {
    return (
      <div className="game-container">
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
              />
            </div>
            
            <button 
              className="start-game-button" 
              onClick={handleCreateGame}
              disabled={loading || !playerName.trim()}
            >
              {loading ? "Creating..." : "Create New Game"}
            </button>
            
            <div className="or-divider">OR</div>
            
            <button 
              onClick={() => setJoinMode(true)}
              className="join-button"
              style={{ display: 'block', width: '100%', margin: '15px 0', padding: '12px', backgroundColor: '#007bff', color: 'white' }}
            >
              Join Existing Game
            </button>
            
            <button 
              onClick={async () => {
                console.log("🧪 Testing Firebase connection and permissions...");
                await testFirebaseConnection();
              }}
              style={{ marginTop: '10px', backgroundColor: '#9c27b0', color: 'white' }}
            >
              Test Firebase Connection
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
              />
            </div>
            
            <div className="form-group">
              <label>Game Code</label>
              <input
                type="text"
                value={gameIdInput}
                onChange={(e) => setGameIdInput(e.target.value)}
                placeholder="Enter game code"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setJoinMode(false)}
                style={{ flex: 1, backgroundColor: '#6c757d', color: 'white' }}
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
                style={{ flex: 2, backgroundColor: '#007bff', color: 'white' }}
              >
                {loading ? "Joining..." : "Join Game"}
              </button>
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={() => {
                  console.log("🧪 TEST: Direct join test button clicked");
                  console.log("🧪 TEST: Current form state:", { playerName, gameIdInput });
                  handleJoinGame();
                }}
                style={{ backgroundColor: '#ff9800', color: 'white' }}
              >
                Debug Join (Test)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Lobby screen
  if (gameState === 'lobby') {
    return (
      <div className="game-container">
        <h1>Game Lobby</h1>
        <h2>Code: {joinedGameId}</h2>
        <p>Share this code with others to join!</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="players-list">
          <h3>Players ({gameData ? Object.keys(gameData.players).length : 0})</h3>
          {gameData && Object.entries(gameData.players).map(([key, player]) => (
            <div 
              key={key} 
              className={`player-item ${player.isHost ? 'host' : ''} ${player.name === playerName ? 'current-player' : ''}`}
            >
              {player.name} {player.isHost ? '(Host)' : ''} {player.name === playerName ? '(You)' : ''}
            </div>
          ))}
        </div>
        
        {gameData && Object.values(gameData.players).some(p => p.name === playerName && p.isHost) && (
          <button 
            className="start-game-button"
            onClick={handleStartGame}
            disabled={loading || Object.keys(gameData.players).length < 2}
          >
            {loading ? "Starting..." : "Start Game"}
          </button>
        )}
        
        {gameData && gameData.host !== playerName && (
          <p className="waiting-message">Waiting for host to start the game...</p>
        )}
        
        {gameData && gameData.host === playerName && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => testAddPlayer(joinedGameId, "TestGuest" + Math.floor(Math.random() * 1000))}
              style={{ backgroundColor: '#ff9800', color: 'white' }}
            >
              Test Direct Player Add
            </button>
            
            <button 
              onClick={() => improvedTestAddPlayer(joinedGameId)}
              style={{ backgroundColor: '#e91e63', color: 'white' }}
            >
              Improved Test Player Add
            </button>
            
            <button onClick={debugDatabase}>
              Debug Database
            </button>
          </div>
        )}
        
        {gameData && (
          <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px'}}>
            <h4>Game Status</h4>
            <p>Game ID: {joinedGameId}</p>
            <p>Status: {gameData.status}</p>
            <p>Host: {gameData.host}</p>
            <p>Players: {gameData.players ? Object.values(gameData.players).map(p => p.name).join(', ') : ''}</p>
            <p>Player Count: {Object.keys(gameData.players || {}).length}</p>
          </div>
        )}
      </div>
    );
  }
  
  // Playing screen
  if (gameState === 'playing') {
    // Find player by name - this is the correct approach
    const playerObj = gameData ? Object.values(gameData.players).find(p => p.name === playerName) : null;
    
    if (!playerObj) {
      console.error("Player not found in game data");
      return (
        <div className="game-container">
          <div className="error-message">
            Player data not found. Please refresh or rejoin the game.
          </div>
          <button onClick={() => window.location.reload()}>
            Refresh Game
          </button>
        </div>
      );
    }
    
    // If player has already submitted donations
    if (playerObj.ready) {
      return (
        <div className="game-container">
          <h1>Day {gameData.day} - Waiting for Others</h1>
          
          <div className="waiting-screen">
            <p>You've submitted your donations. Waiting for other players...</p>
            
            <div className="donations-summary">
              <h3>Your Donations:</h3>
              {Object.entries(currentDonations).map(([recipient, data]) => (
                data.amount > 0 && (
                  <div key={recipient} className="donation-summary-item">
                    <p>To {recipient}: ${data.amount}</p>
                    {data.message && <p className="donation-message">"{data.message}"</p>}
                  </div>
                )
              ))}
            </div>
            
            <div className="player-status-list">
              {Object.values(gameData.players).map(player => (
                <div key={player.name} className={`player-status ${player.ready ? 'ready' : 'pending'}`}>
                  {player.name}: {player.ready ? 'Ready ✓' : 'Deciding...'}
                </div>
              ))}
            </div>
            
            {gameData.host === playerName && 
             Object.values(gameData.players).every(p => p.ready) && (
              <button 
                className="process-button" 
                onClick={handleProcessDonations}
                disabled={loading}
              >
                {loading ? "Processing..." : "Everyone is ready! Process donations"}
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Donations interface
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>Money Game - Day {gameData.day}/3</h1>
          <div className="player-turn-indicator">
            {playerName}'s Turn
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="player-info">
          <h2>{playerName}</h2>
          <p>Your Balance: ${playerObj.money}</p>
          <p>Remaining After Donations: ${playerObj.money - calculateTotalDonations()}</p>
        </div>
        
        {/* Add this new section to show received donations */}
        {gameData.donations && gameData.donations[gameData.day] && (
          <div className="received-donations">
            <h3>Received Donations</h3>
            <div className="received-donations-list">
              {getReceivedDonations(gameData, gameData.day, playerName).map((donation, index) => (
                <div key={index} className="received-donation-item">
                  <p>From {donation.from}: ${donation.amount} (doubled to ${donation.amount * 2})</p>
                  {donation.message && (
                    <p className="received-message">"{donation.message}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="donation-interface">
          <div className="self-box">
            <span className="self-label">Self</span>
            <div className="money-display">
              ${playerObj.money - calculateTotalDonations()}
            </div>
          </div>
          
          <div className="donate-area">
            <div className="donate-box">Donate</div>
            <div className="recipient-connections">
              {Object.values(gameData.players).map(player => (
                player.name !== playerName && (
                  <div key={player.name} className="recipient-connection">
                    <div className="recipient-name">{player.name}</div>
                    <div className="multiplier">2×</div>
                    <div className="donation-inputs">
                      <input
                        type="number"
                        min="0"
                        max={playerObj.money}
                        value={currentDonations[player.name]?.amount || ""}
                        onChange={(e) => handleDonationChange(player.name, e.target.value)}
                        className="donation-input"
                        placeholder="Amount"
                      />
                      <input
                        type="text"
                        value={currentDonations[player.name]?.message || ""}
                        onChange={(e) => handleDonationChange(player.name, currentDonations[player.name]?.amount || 0, e.target.value)}
                        className="message-input"
                        placeholder="Add a message..."
                        maxLength={50}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="submit-button" 
          onClick={handleSubmitDonations}
          disabled={loading || calculateTotalDonations() > playerObj.money}
        >
          {loading ? "Submitting..." : "Submit Donations"}
        </button>
      </div>
    );
  }
  
  // Game over screen
  if (gameState === 'gameover') {
    const allHaveEnough = Object.values(gameData.players).every(p => p.money >= 1000);
    
    return (
      <div className="game-container">
        <h1>{allHaveEnough ? "Victory!" : "Game Over"}</h1>
        
        <div className="game-result">
          <p>{allHaveEnough 
            ? "Congratulations! Everyone reached the goal of $1000!" 
            : "Not everyone reached the goal of $1000."}
          </p>
          
          <div className="final-results">
            {Object.entries(gameData.players).map(([name, player]) => (
              <div 
                key={name} 
                className={`player-result ${player.money >= 1000 ? "success" : "failure"}`}
              >
                <h3>{player.name}</h3>
                <p>${player.money}</p>
                <p>{player.money >= 1000 ? "✅ Goal reached" : "❌ Below goal"}</p>
              </div>
            ))}
          </div>
        </div>
        
        <button className="restart-button" onClick={() => window.location.reload()}>
          Play Again
        </button>
      </div>
    );
  }
  
  return <div>Loading...</div>;
}

export default App; 