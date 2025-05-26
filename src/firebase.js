import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onDisconnect,
  update,
} from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKwFy6VEGLfMtEJbJmwCF8Bfp6p-KZ1ho",
  authDomain: "cs278-final-67682.firebaseapp.com",
  databaseURL: "https://cs278-final-67682-default-rtdb.firebaseio.com",
  projectId: "cs278-final-67682",
  storageBucket: "cs278-final-67682.firebasestorage.app",
  messagingSenderId: "976681255575",
  appId: "1:976681255575:web:1fe065069b7553f6cddfd2",
  measurementId: "G-106D90ZQ5J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Monitor WebSocket connection status
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
  const isConnected = snap.val();
  console.log(
    "🔌 WEBSOCKET CONNECTION STATUS:",
    isConnected ? "CONNECTED" : "DISCONNECTED"
  );
});

// Create a new game
const createGame = async (gameId, hostName) => {
  try {
    console.log(
      "📣 BROADCAST: Creating new game:",
      gameId,
      "with host:",
      hostName
    );
    const normalizedGameId = gameId.trim().toUpperCase();

    const playerKey = `player_${hostName}`;
    const gameRef = ref(db, `games/${normalizedGameId}`);
    const gameData = {
      status: "waiting",
      day: 1,
      host: hostName,
      players: {},
      created: new Date().toISOString(),
    };

    gameData.players[playerKey] = {
      name: hostName,
      money: 100,
      isHost: true,
      ready: false,
    };

    await set(gameRef, gameData);
    console.log("📣 BROADCAST SENT: Game created, data:", gameData);

    // Make sure to define snapshot before using it
    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
      console.log("✅ Game creation verified in database");
      return true;
    } else {
      console.error("❌ Game creation failed - not found in database");
      return false;
    }
  } catch (error) {
    console.error("❌ Error creating game:", error);
    return false;
  }
};

// Replace your joinGame function with this version
const joinGame = async (gameId, playerName) => {
  console.log("🔍 FIREBASE: joinGame function called with:", {
    gameId,
    playerName,
  });

  if (!playerName || !playerName.trim()) {
    console.log("❌ FIREBASE: Empty player name");
    return { success: false, message: "Please enter your name" };
  }

  if (!gameId || !gameId.trim()) {
    console.log("❌ FIREBASE: Empty game ID");
    return { success: false, message: "Please enter a game code" };
  }

  try {
    const normalizedGameId = gameId.trim().toUpperCase();
    const playerKey = `player_${playerName}`;

    console.log(
      `🧪 JOIN: Adding player "${playerName}" to game "${normalizedGameId}"`
    );

    // First check if the game exists
    const gameRef = ref(db, `games/${normalizedGameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      console.error(`❌ Game not found: ${normalizedGameId}`);
      return { success: false, message: "Game not found" };
    }

    // Check if game already started
    if (snapshot.val().status !== "waiting") {
      console.error(`❌ Game already started: ${normalizedGameId}`);
      return { success: false, message: "Game has already started" };
    }

    // Check if name is already taken
    if (snapshot.val().players) {
      const existingPlayer = Object.values(snapshot.val().players).find(
        (p) => p.name === playerName
      );
      if (existingPlayer) {
        console.error(`❌ Name already taken: ${playerName}`);
        return { success: false, message: "That name is already taken" };
      }
    }

    // USE EXACTLY THE SAME METHOD THAT WORKS IN testAddPlayer
    console.log(`🧪 Using direct set method to add player...`);
    await set(ref(db, `games/${normalizedGameId}/players/${playerKey}`), {
      name: playerName,
      money: 100,
      isHost: false,
      ready: false,
    });

    // Verify the player was added
    const verifySnapshot = await get(
      ref(db, `games/${normalizedGameId}/players/${playerKey}`)
    );
    if (verifySnapshot.exists()) {
      console.log(`✅ Player added successfully: ${playerName}`);
      return { success: true };
    } else {
      console.error(`❌ Failed to add player: ${playerName}`);
      return { success: false, message: "Failed to join game" };
    }
  } catch (error) {
    console.error(`❌ Error joining game:`, error);
    return { success: false, message: error.message };
  }
};

// Listen for game updates
const listenToGame = (gameId, callback) => {
  console.log(`👂 WEBSOCKET: Setting up listener for game: ${gameId}`);
  const gameRef = ref(db, `games/${gameId}`);

  return onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      const gameData = snapshot.val();
      console.log(
        `👂 WEBSOCKET RECEIVED DATA:`,
        JSON.stringify(gameData, null, 2)
      );

      // Specifically check players
      if (gameData.players) {
        console.log(`👥 PLAYERS FOUND:`, Object.keys(gameData.players).length);
        console.log(
          `👥 PLAYER DATA:`,
          JSON.stringify(gameData.players, null, 2)
        );
      } else {
        console.log(`❌ NO PLAYERS FOUND in game data`);
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

    console.log(
      `🧪 TEST: Directly adding player "${playerName}" to game "${normalizedGameId}"`
    );

    await set(ref(db, `games/${normalizedGameId}/players/${playerKey}`), {
      name: playerName,
      money: 100,
      isHost: false,
      ready: false,
    });

    // Verify
    const verifySnapshot = await get(
      ref(db, `games/${normalizedGameId}/players/${playerKey}`)
    );
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
    await set(ref(db, `games/${gameId}/status`), "active");
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
    console.log(
      `📣 BROADCAST: Player ${playerName} submitting donations for day ${day}`,
      donations
    );
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

    // Use dayKey format "dayX"
    const dayKey = `day${day}`;
    console.log(`📣 BROADCAST: Setting donations for ${dayKey}`);
    await set(
      ref(db, `games/${gameId}/donations/${dayKey}/${playerName}`),
      donations
    );

    console.log(
      `📣 BROADCAST: Setting player ${playerName} ready status to true`
    );
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

    // Use dayKey format "dayX"
    const dayKey = `day${day}`;

    console.log(
      `Processing ${dayKey} donations:`,
      donations && donations[dayKey] ? donations[dayKey] : "No donations"
    );

    // Process donations
    const updatedPlayers = { ...players };

    if (donations && donations[dayKey]) {
      Object.entries(donations[dayKey]).forEach(
        ([donorName, recipientData]) => {
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

          Object.entries(recipientData).forEach(([recipientName, data]) => {
            const numAmount = Number(data.amount);
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

            // Add tripled amount to recipient
            updatedPlayers[recipientKey].money += numAmount * 3;
            console.log(
              `💰 ${recipientName} receives $${
                numAmount * 3
              } from ${donorName} with message: ${data.message}`
            );
          });

          // Subtract from donor
          updatedPlayers[donorKey].money -= totalDonated;
          console.log(`💸 ${donorName} donated $${totalDonated} total`);
        }
      );
    }

    // Add daily $100 to each player
    Object.keys(updatedPlayers).forEach((playerKey) => {
      updatedPlayers[playerKey].money += 100;
      updatedPlayers[playerKey].ready = false;
      console.log(
        `💵 ${updatedPlayers[playerKey].name} receives $100 daily income`
      );
    });

    // Update game data
    if (day < 3) {
      console.log(
        `📣 BROADCAST: Updating player data and advancing to day ${day + 1}`
      );
      await set(ref(db, `games/${gameId}/players`), updatedPlayers);
      await set(ref(db, `games/${gameId}/day`), day + 1);
      console.log(`📣 BROADCAST SENT: Day advanced to ${day + 1}`);
      return true;
    } else {
      // Game over
      const allHaveEnough = Object.values(updatedPlayers).every(
        (player) => player.money >= 1000
      );
      console.log(
        `📣 BROADCAST: Game ending with result: ${
          allHaveEnough ? "victory" : "defeat"
        }`
      );
      await set(ref(db, `games/${gameId}/players`), updatedPlayers);
      await set(ref(db, `games/${gameId}/status`), "completed");
      await set(
        ref(db, `games/${gameId}/result`),
        allHaveEnough ? "victory" : "defeat"
      );
      console.log(`📣 BROADCAST SENT: Game completed`);
      return true;
    }
  } catch (error) {
    console.error("❌ Error processing donations:", error);
    return false;
  }
};

// Add a new direct test function
const testFirebaseConnection = async () => {
  console.log("🧪 TESTING FIREBASE CONNECTION");
  try {
    // Test database connection
    console.log("🧪 Testing database connection...");
    const testRef = ref(db, ".info/connected");
    const connected = await new Promise((resolve) => {
      onValue(
        testRef,
        (snapshot) => {
          resolve(snapshot.val());
        },
        { onlyOnce: true }
      );
    });
    console.log(
      `🧪 Database connection: ${connected ? "CONNECTED" : "DISCONNECTED"}`
    );

    // Test write permission
    try {
      console.log("🧪 Testing write permission...");
      const writeTestRef = ref(db, `permission_test/${Date.now()}`);
      await set(writeTestRef, { timestamp: Date.now() });
      console.log("✅ Write permission test: SUCCESS");
    } catch (writeError) {
      console.error("❌ Write permission test: FAILED", writeError);
      console.log("📋 This confirms you have a Firebase permissions issue");
    }

    return connected;
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
    return false;
  }
};

// Add this improved test function
const improvedTestAddPlayer = async (gameId) => {
  try {
    const normalizedGameId = gameId.trim().toUpperCase();
    const testPlayerName = "Test" + Math.floor(Math.random() * 10000);
    const playerKey = `player_${testPlayerName}`;

    console.log(
      `🧪 IMPROVED TEST: Adding player "${testPlayerName}" to game "${normalizedGameId}"`
    );

    // First, get current game data
    const gameRef = ref(db, `games/${normalizedGameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      console.error(`❌ IMPROVED TEST: Game "${normalizedGameId}" not found`);
      return false;
    }

    const gameData = snapshot.val();
    console.log(
      `🧪 IMPROVED TEST: Current game data before adding player:`,
      gameData
    );

    // Log current players (if any)
    if (gameData.players) {
      console.log(
        `🧪 IMPROVED TEST: Current players:`,
        Object.keys(gameData.players)
      );
    } else {
      console.log(`🧪 IMPROVED TEST: No players in game data`);
    }

    // Create player data
    const playerData = {
      name: testPlayerName,
      money: 100,
      isHost: false,
      ready: false,
    };

    // Directly update the game data and write it back completely
    const updatedGameData = { ...gameData };
    if (!updatedGameData.players) {
      updatedGameData.players = {};
    }
    updatedGameData.players[playerKey] = playerData;

    console.log(
      `🧪 IMPROVED TEST: Updated game data to write:`,
      updatedGameData
    );

    // Write the entire game data back
    await set(gameRef, updatedGameData);

    // Verify
    const verifySnapshot = await get(gameRef);
    const verifyData = verifySnapshot.val();

    if (verifyData.players && verifyData.players[playerKey]) {
      console.log(
        `✅ IMPROVED TEST: Player "${testPlayerName}" added successfully!`
      );
      console.log(
        `✅ IMPROVED TEST: Updated players:`,
        Object.keys(verifyData.players)
      );
      return true;
    } else {
      console.error(
        `❌ IMPROVED TEST: Player "${testPlayerName}" not found after adding`
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ IMPROVED TEST ERROR:`, error);
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
  testAddPlayer,
  testFirebaseConnection,
  improvedTestAddPlayer,
};
