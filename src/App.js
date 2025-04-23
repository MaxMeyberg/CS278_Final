import { useState } from 'react';
import './App.css';

function MoneyGame() {
  const [gameState, setGameState] = useState('setup'); // setup, playing, summary, gameover
  const [players, setPlayers] = useState([]);
  const [day, setDay] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [donations, setDonations] = useState({});
  const [showPassScreen, setShowPassScreen] = useState(false);
  const [allPlayersSubmitted, setAllPlayersSubmitted] = useState(false);

  // Setup: Add players
  const [playerName, setPlayerName] = useState('');
  
  const addPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer = {
      id: players.length + 1,
      name: playerName,
      money: 100
    };
    
    setPlayers([...players, newPlayer]);
    setPlayerName('');
  };
  
  const startGame = () => {
    if (players.length < 2) {
      alert("You need at least 2 players to start!");
      return;
    }
    
    // Initialize donations structure
    const initialDonations = {};
    players.forEach(player => {
      initialDonations[player.id] = {};
      players.forEach(recipient => {
        if (player.id !== recipient.id) {
          initialDonations[player.id][recipient.id] = 0;
        }
      });
    });
    
    setDonations(initialDonations);
    setGameState('playing');
    setShowPassScreen(true);
  };
  
  // Calculate total donations for current player
  const calculateTotalDonations = () => {
    if (!currentPlayer || !donations[currentPlayer.id]) return 0;
    
    return Object.values(donations[currentPlayer.id]).reduce(
      (sum, amount) => sum + Number(amount || 0), 0
    );
  };
  
  // Current player
  const currentPlayer = players[currentPlayerIndex];
  
  // Handle donation change
  const handleDonationChange = (recipientId, amount) => {
    const numAmount = amount === '' ? 0 : Number(amount);
    if (numAmount < 0) return;
    
    setDonations(prev => ({
      ...prev,
      [currentPlayer.id]: {
        ...prev[currentPlayer.id],
        [recipientId]: numAmount
      }
    }));
  };
  
  // Submit donations for current player
  const submitDonations = () => {
    const total = calculateTotalDonations();
    
    if (total > currentPlayer.money) {
      alert("You don't have enough money for these donations!");
      return;
    }
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setShowPassScreen(true);
    } else {
      setAllPlayersSubmitted(true);
    }
  };
  
  // Process all donations and advance to next day
  const processDonations = () => {
    const updatedPlayers = [...players];
    
    // Process each player's donations
    players.forEach(donor => {
      const donorIndex = updatedPlayers.findIndex(p => p.id === donor.id);
      let totalDonated = 0;
      
      if (donations[donor.id]) {
        Object.entries(donations[donor.id]).forEach(([recipientId, amount]) => {
          const numAmount = Number(amount || 0);
          if (numAmount > 0) {
            totalDonated += numAmount;
            
            // Add doubled amount to recipient
            const recipientIndex = updatedPlayers.findIndex(
              p => p.id === Number(recipientId)
            );
            updatedPlayers[recipientIndex].money += numAmount * 2;
          }
        });
        
        // Subtract from donor
        updatedPlayers[donorIndex].money -= totalDonated;
      }
    });
    
    // Add daily $100 to each player
    updatedPlayers.forEach((player, index) => {
      updatedPlayers[index].money += 100;
    });
    
    setPlayers(updatedPlayers);
    
    // Reset donations
    const resetDonations = {};
    players.forEach(player => {
      resetDonations[player.id] = {};
      players.forEach(recipient => {
        if (player.id !== recipient.id) {
          resetDonations[player.id][recipient.id] = 0;
        }
      });
    });
    setDonations(resetDonations);
    
    // Reset player status
    setCurrentPlayerIndex(0);
    setAllPlayersSubmitted(false);
    
    // Move to next day or end game
    if (day < 3) {
      setDay(day + 1);
      setGameState('summary');
    } else {
      setGameState('gameover');
    }
  };
  
  // Continue to next day
  const continueToNextDay = () => {
    setGameState('playing');
    setShowPassScreen(true);
  };
  
  // Restart game
  const restartGame = () => {
    setGameState('setup');
    setPlayers([]);
    setDay(1);
    setCurrentPlayerIndex(0);
    setDonations({});
    setAllPlayersSubmitted(false);
  };
  
  // Render based on game state
  if (gameState === 'setup') {
    return (
      <div className="game-container">
        <h1>Money Game Setup</h1>
        
        <div className="setup-section">
          <h2>Add Players</h2>
          <div className="add-player-form">
            <input
              type="text"
              placeholder="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button onClick={addPlayer}>Add Player</button>
          </div>
          
          <div className="players-list">
            <h3>Players ({players.length})</h3>
            {players.length === 0 ? (
              <p>No players added yet</p>
            ) : (
              <ul>
                {players.map((player, index) => (
                  <li key={index}>{player.name}</li>
                ))}
              </ul>
            )}
          </div>
          
          <button 
            className="start-game-button" 
            onClick={startGame}
            disabled={players.length < 2}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }
  
  if (gameState === 'playing') {
    if (showPassScreen) {
      return (
        <div className="pass-screen">
          <h2>{currentPlayer.name}'s Turn</h2>
          <p>Please ensure no other players are looking at the screen</p>
          <div className="privacy-warning">
            🔒 PRIVACY MODE 🔒
          </div>
          <button className="continue-button" onClick={() => setShowPassScreen(false)}>
            I am {currentPlayer.name} - Show My Information
          </button>
        </div>
      );
    }
    
    if (allPlayersSubmitted) {
      return (
        <div className="game-container">
          <h1>Day {day} Complete</h1>
          <p>All players have submitted their donations.</p>
          <button className="process-button" onClick={processDonations}>
            Process Donations
          </button>
        </div>
      );
    }
    
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>Money Game - Day {day}/3</h1>
          <div className="player-turn-indicator">
            {currentPlayer.name}'s Turn
          </div>
        </div>
        
        <div className="player-info">
          <h2>{currentPlayer.name}</h2>
          <p>Your Balance: ${currentPlayer.money}</p>
          <p>Remaining After Donations: ${currentPlayer.money - calculateTotalDonations()}</p>
        </div>
        
        <div className="donation-interface">
          <div className="self-box">
            <span className="self-label">Self</span>
            <div className="money-display">
              ${currentPlayer.money - calculateTotalDonations()}
            </div>
          </div>
          
          <div className="donate-area">
            <div className="donate-box">Donate</div>
            <div className="recipient-connections">
              {players.map((recipient) => (
                recipient.id !== currentPlayer.id && (
                  <div key={recipient.id} className="recipient-connection">
                    <div className="recipient-name">{recipient.name}</div>
                    <div className="multiplier">2×</div>
                    <input
                      type="number"
                      min="0"
                      max={currentPlayer.money}
                      value={donations[currentPlayer.id]?.[recipient.id] || ""}
                      onChange={(e) => handleDonationChange(recipient.id, e.target.value)}
                      className="donation-input"
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="submit-button" 
          onClick={submitDonations}
          disabled={calculateTotalDonations() > currentPlayer.money}
        >
          Submit Donations
        </button>
      </div>
    );
  }
  
  if (gameState === 'summary') {
    return (
      <div className="game-container">
        <h1>Day {day} Summary</h1>
        
        <div className="day-summary">
          <p>All donations have been processed and everyone received $100.</p>
          
          <div className="players-summary">
            {players.map((player, index) => (
              <div key={index} className="player-summary">
                <h3>{player.name}</h3>
                <p>${player.money}</p>
              </div>
            ))}
          </div>
        </div>
        
        <button className="continue-button" onClick={continueToNextDay}>
          Continue to Day {day}
        </button>
      </div>
    );
  }
  
  if (gameState === 'gameover') {
    const allHaveEnough = players.every(player => player.money >= 1000);
    
    return (
      <div className="game-container">
        <h1>{allHaveEnough ? "Victory!" : "Game Over"}</h1>
        
        <div className="game-result">
          <p>{allHaveEnough 
            ? "Congratulations! Everyone reached the goal of $1000!" 
            : "Not everyone reached the goal of $1000."}
          </p>
          
          <div className="final-results">
            {players.map((player, index) => (
              <div 
                key={index} 
                className={`player-result ${player.money >= 1000 ? "success" : "failure"}`}
              >
                <h3>{player.name}</h3>
                <p>${player.money}</p>
                <p>{player.money >= 1000 ? "✅ Goal reached" : "❌ Below goal"}</p>
              </div>
            ))}
          </div>
        </div>
        
        <button className="restart-button" onClick={restartGame}>
          Play Again
        </button>
      </div>
    );
  }
  
  return <div>Loading...</div>;
}

export default MoneyGame;