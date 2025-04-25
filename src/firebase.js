import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, onDisconnect, update } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKwFy6VEGLfMtEJbJmwCF8Bfp6p-KZ1ho",
  authDomain: "cs278-final-67682.firebaseapp.com",
  databaseURL: "https://cs278-final-67682-default-rtdb.firebaseio.com",
  projectId: "cs278-final-67682",
  storageBucket: "cs278-final-67682.firebasestorage.app",
  messagingSenderId: "976681255575",
  appId: "1:976681255575:web:1fe065069b7553f6cddfd2",
  measurementId: "G-106D90ZQ5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Monitor WebSocket connection status
const connectedRef = ref(db, '.info/connected');
onValue(connectedRef, (snap) => {
  const isConnected = snap.val();
  console.log('🔌 WEBSOCKET CONNECTION STATUS:', isConnected ? 'CONNECTED' : 'DISCONNECTED');
});

// Create a new game
const createGame = async (gameId, hostName) => {
  try {
    console.log('📣 BROADCAST: Creating new game:', gameId, 'with host:', hostName);
    const normalizedGameId = gameId.trim().toUpperCase();
    
    const playerKey = `player_${hostName}`;
    const gameRef = ref(db, `games/${normalizedGameId}`);
    const gameData = {
      status: 'waiting',
      day: 1,
      host: hostName,
      players: {}, 
      created: new Date().toISOString()
    };
    
    gameData.players[playerKey] = {
      name: hostName,
      money: 100,
      isHost: true,
      ready: false
    };
    
    await set(gameRef, gameData);
    console.log('📣 BROADCAST SENT: Game created, data:', gameData);
    
    // Set up host presence tracking
    const presenceRef = ref(db, `games/${normalizedGameId}/presence/${playerKey}`);
    await set(presenceRef, true);
    onDisconnect(presenceRef).set(false);
    console.log('👤 Host presence tracking enabled');
    
    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
      console.log('✅ Game creation verified in database');
      return true;
    } else {
      console.error('❌ Game creation failed - not found in database');
      return false;
    }
  } catch (error) {
    console.error("❌ Error creating game:", error);
    return false;
  }
};

// Join a game - IMPROVED WITH EXTENSIVE ERROR HANDLING
const joinGame = async (gameId, playerName) => {
  if (!playerName || !playerName.trim()) {
    console.error("❌ JOIN ERROR: Empty player name");
    return { success: false, message: "Please enter your name" };
  }
  
  try {
    const normalizedGameId = gameId.trim().toUpperCase();
    const playerKey = `player_${playerName}`;
    
    console.log(`📣 JOIN ATTEMPT: Player "${playerName}" with key "${playerKey}" attempting to join game: "${normalizedGameId}"`);
    
    // First check if the game exists
    const gameRef = ref(db, `games/${normalizedGameId}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      console.error(`❌ JOIN ERROR: Game "${normalizedGameId}" not found during join attempt`);
      return { success: false, message: "Game not found" };
    }
    
    const gameData = snapshot.val();
    console.log('✅ Game found:', gameData);
    console.log('📊 Current players:', gameData.players ? Object.keys(gameData.players) : 'none');
    
    if (gameData.status !== 'waiting') {
      console.error('❌ JOIN ERROR: Cannot join - game already started');
      return { success: false, message: "Game has already started" };
    }
    
    // Check if name is already taken
    if (gameData.players) {
      const existingPlayer = Object.values(gameData.players).find(p => p.name === playerName);
      if (existingPlayer) {
        console.error(`❌ JOIN ERROR: Name "${playerName}" already taken`);
        return { success: false, message: "That name is already taken" };
      }
    }
    
    // Direct method to add player
    const playerData = {
      name: playerName,
      money: 100,
      isHost: false,
      ready: false
    };
    
    // Method 1: Set the specific player path
    console.log(`📣 JOIN OPERATION: Adding player using method 1 - direct set`);
    const playerRef = ref(db, `games/${normalizedGameId}/players/${playerKey}`);
    await set(playerRef, playerData);
    
    // Method 2: Update the game's players object (as a backup)
    console.log(`📣 JOIN OPERATION: Adding player using method 2 - update operation`);
    const updates = {};
    updates[`games/${normalizedGameId}/players/${playerKey}`] = playerData;
    await update(ref(db), updates);
    
    // Set up player presence tracking
    console.log(`📣 JOIN OPERATION: Setting up presence tracking`);
    const presenceRef = ref(db, `games/${normalizedGameId}/presence/${playerKey}`);
    await set(presenceRef, true);
    onDisconnect(presenceRef).set(false);
    
    // Verify the player was added
    console.log(`📣 JOIN VERIFICATION: Checking if player was added to the game`);
    const verifySnapshot = await get(ref(db, `games/${normalizedGameId}/players/${playerKey}`));
    if (verifySnapshot.exists()) {
      console.log(`✅ JOIN SUCCESS: Player "${playerName}" successfully added to game!`);
      return { success: true };
    } else {
      console.error(`❌ JOIN ERROR: Player "${playerName}" was not added to the game after attempts`);
      return { success: false, message: "Failed to join game - database write failed" };
    }
  } catch (error) {
    console.error(`❌ JOIN ERROR: Error joining game:`, error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

// Listen for game updates
const listenToGame = (gameId, callback) => {
  console.log(`👂 WEBSOCKET: Setting up listener for game: ${gameId}`);
  const gameRef = ref(db, `games/${gameId}`);
  
  return onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      const gameData = snapshot.val();
      console.log(`📥 WEBSOCKET RECEIVED: Update for game ${gameId}`);
      console.log(`📊 Current players:`, gameData.players ? Object.keys(gameData.players) : 'none');
      
      // Check for player presence
      if (gameData.presence) {
        const activePlayers = Object.entries(gameData.presence)
          .filter(([_, isPresent]) => isPresent)
          .map(([key]) => key.replace('player_', ''));
        
        console.log(`👥 Active players: ${activePlayers.join(', ')}`);
      }
      
      callback(gameData);
    } else {
      console.error(`❌ WEBSOCKET ERROR: Game ${gameId} not found in listener`);
      callback(null);
    }
  });
};

// Test function to directly add a player to a game (for debugging)
const testAddPlayer = async (gameId, playerName) => {
  try {
    const normalizedGameId = gameId.trim().toUpperCase();
    const playerKey = `player_${playerName}`;
    
    console.log(`🧪 TEST: Directly adding player "${playerName}" to game "${normalizedGameId}"`);
    
    await set(ref(db, `games/${normalizedGameId}/players/${playerKey}`), {
      name: playerName,
      money: 100,
      isHost: false,
      ready: false
    });
    
    // Verify
    const verifySnapshot = await get(ref(db, `games/${normalizedGameId}/players/${playerKey}`));
    if (verifySnapshot.exists()) {
      console.log(`✅ TEST SUCCESS: Player added directly`);
      return true;
    } else {
      console.error(`❌ TEST FAILED: Player not added`);
      return false;
    }
  } catch (error) {
    console.error(`❌ TEST ERROR:`, error);
    return false;
  }
};

// Start the game
const startGame = async (gameId) => {
  try {
    console.log(`📣 BROADCAST: Starting game ${gameId}`);
    await set(ref(db, `games/${gameId}/status`), 'active');
    console.log(`📣 BROADCAST SENT: Game ${gameId} status set to active`);
    return true;
  } catch (error) {
    console.error("❌ Error starting game:", error);
    return false;
  }
};

// Submit donations
const submitDonations = async (gameId, playerName, donations, day) => {
  try {
    console.log(`📣 BROADCAST: Player ${playerName} submitting donations`, donations);
    const gameRef = ref(db, `games/${gameId}`);
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
      console.error(`❌ Game ${gameId} not found during donations`);
      return false;
    }
    
    const gameData = snapshot.val();
    let playerKey = null;
    
    // Find the key for this player
    Object.entries(gameData.players).forEach(([key, player]) => {
      if (player.name === playerName) {
        playerKey = key;
      }
    });
    
    if (!playerKey) {
      console.error(`❌ Player ${playerName} not found for donations`);
      return false;
    }
    
    // Set donations and ready status
    console.log(`📣 BROADCAST: Setting donations for day ${day}`);
    await set(ref(db, `games/${gameId}/donations/${day}/${playerName}`), donations);
    
    console.log(`📣 BROADCAST: Setting player ${playerName} ready status to true`);
    await set(ref(db, `games/${gameId}/players/${playerKey}/ready`), true);
    
    console.log(`📣 BROADCAST SENT: Donations submitted for ${playerName}`);
    return true;
  } catch (error) {
    console.error("❌ Error submitting donations:", error);
    return false;
  }
};

// Process all donations and advance day
const processDonations = async (gameId) => {
  try {
    console.log(`📣 BROADCAST: Processing donations for game ${gameId}`);
    const gameRef = ref(db, `games/${gameId}`);
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
      console.error(`❌ Game ${gameId} not found during processing`);
      return false;
    }
    
    const gameData = snapshot.val();
    const { players, donations, day } = gameData;
    
    console.log(`Processing day ${day} donations:`, donations && donations[day] ? donations[day] : 'No donations');
    
    // Process donations
    const updatedPlayers = { ...players };
    
    if (donations && donations[day]) {
      Object.entries(donations[day]).forEach(([donorName, recipientAmounts]) => {
        let totalDonated = 0;
        
        // Find donor player key
        let donorKey = null;
        Object.entries(players).forEach(([key, player]) => {
          if (player.name === donorName) {
            donorKey = key;
          }
        });
        
        if (!donorKey) {
          console.error(`❌ Donor ${donorName} not found`);
          return;
        }
        
        Object.entries(recipientAmounts).forEach(([recipientName, amount]) => {
          const numAmount = Number(amount);
          totalDonated += numAmount;
          
          // Find recipient player key
          let recipientKey = null;
          Object.entries(players).forEach(([key, player]) => {
            if (player.name === recipientName) {
              recipientKey = key;
            }
          });
          
          if (!recipientKey) {
            console.error(`❌ Recipient ${recipientName} not found`);
            return;
          }
          
          // Add doubled amount to recipient
          updatedPlayers[recipientKey].money += numAmount * 2;
          console.log(`💰 ${recipientName} receives $${numAmount * 2} from ${donorName}`);
        });
        
        // Subtract from donor
        updatedPlayers[donorKey].money -= totalDonated;
        console.log(`💸 ${donorName} donated $${totalDonated} total`);
      });
    }
    
    // Add daily $100 to each player
    Object.keys(updatedPlayers).forEach(playerKey => {
      updatedPlayers[playerKey].money += 100;
      updatedPlayers[playerKey].ready = false;
      console.log(`💵 ${updatedPlayers[playerKey].name} receives $100 daily income`);
    });
    
    // Update game data
    if (day < 3) {
      console.log(`📣 BROADCAST: Updating player data and advancing to day ${day + 1}`);
      await set(ref(db, `games/${gameId}/players`), updatedPlayers);
      await set(ref(db, `games/${gameId}/day`), day + 1);
      console.log(`📣 BROADCAST SENT: Day advanced to ${day + 1}`);
      return true;
    } else {
      // Game over
      const allHaveEnough = Object.values(updatedPlayers).every(player => player.money >= 1000);
      console.log(`📣 BROADCAST: Game ending with result: ${allHaveEnough ? 'victory' : 'defeat'}`);
      await set(ref(db, `games/${gameId}/players`), updatedPlayers);
      await set(ref(db, `games/${gameId}/status`), 'completed');
      await set(ref(db, `games/${gameId}/result`), allHaveEnough ? 'victory' : 'defeat');
      console.log(`📣 BROADCAST SENT: Game completed`);
      return true;
    }
  } catch (error) {
    console.error("❌ Error processing donations:", error);
    return false;
  }
};

export {
  createGame,
  joinGame,
  listenToGame,
  startGame,
  submitDonations,
  processDonations,
  testAddPlayer
}; 