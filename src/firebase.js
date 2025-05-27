/* ------------------------------------------------------------------
   Firebase helpers for Money Game – FINAL FIX
   • Modular Web SDK v9
   • Each player lives under a push()‑generated key
   • onDisconnect() cleans up the node if the socket drops
------------------------------------------------------------------ */
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  push,
  update,
  onDisconnect,
} from "firebase/database";

/* 1️⃣  CONFIG ------------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyBKwFy6VEGLfMtEJbJmwCF8Bfp6p-KZ1ho",
  authDomain: "cs278-final-67682.firebaseapp.com",
  databaseURL: "https://cs278-final-67682-default-rtdb.firebaseio.com",
  projectId: "cs278-final-67682",
  storageBucket: "cs278-final-67682.appspot.com",
  messagingSenderId: "976681255575",
  appId: "1:976681255575:web:1fe065069b7553f6cddfd2",
  measurementId: "G-106D90ZQ5J",
};
initializeApp(firebaseConfig);
const db = getDatabase();

/* 2️⃣  CREATE GAME ------------------------------------------------- */
export const createGame = async (gameId, hostName) => {
  const id = gameId.trim().toUpperCase();
  const gameRef = ref(db, `games/${id}`);
  const hostRef = push(ref(db, `games/${id}/players`));

  await set(gameRef, {
    status: "waiting",
    day: 1,
    host: hostName,
    created: Date.now(),
  });
  await set(hostRef, {
    name: hostName,
    money: 100,
    isHost: true,
    ready: false,
  });
  onDisconnect(hostRef).remove();
  return { success: true, playerKey: hostRef.key };
};

/* 3️⃣  JOIN GAME --------------------------------------------------- */
export const joinGame = async (gameId, playerName) => {
  const id = gameId.trim().toUpperCase();
  const name = playerName.trim();
  if (!name) return { success: false, message: "Enter your name" };
  if (!id) return { success: false, message: "Enter a game code" };

  const gameSnap = await get(ref(db, `games/${id}`));
  if (!gameSnap.exists()) return { success: false, message: "Game not found" };
  if (gameSnap.val().status !== "waiting")
    return { success: false, message: "Game has already started" };
  if (Object.values(gameSnap.val().players || {}).some((p) => p.name === name))
    return { success: false, message: "That name is already taken" };

  const playerRef = push(ref(db, `games/${id}/players`));
  await set(playerRef, { name, money: 100, isHost: false, ready: false });
  onDisconnect(playerRef).remove();
  return { success: true, playerKey: playerRef.key };
};

/* 4️⃣  REALTIME LISTENER ------------------------------------------- */
export const listenToGame = (gameId, cb) => {
  const gameRef = ref(db, `games/${gameId}`);
  const unsubscribe = onValue(gameRef, (snap) =>
    cb(snap.exists() ? snap.val() : null)
  );
  return () => off(gameRef, "value", unsubscribe);
};

/* 5️⃣  GAME FLOW --------------------------------------------------- */
export const startGame = (gameId) =>
  set(ref(db, `games/${gameId}/status`), "active");

export const submitDonations = async (gameId, donorName, donations, day) => {
  const dayKey = `day${day}`;
  await update(ref(db), {
    [`games/${gameId}/donations/${dayKey}/${donorName}`]: donations,
  });
  await setDonorReady(gameId, donorName, true);
  return true;
};

const setDonorReady = async (gameId, donorName, ready) => {
  const snap = await get(ref(db, `games/${gameId}/players`));
  if (!snap.exists()) return;
  const entry = Object.entries(snap.val()).find(
    ([, p]) => p.name === donorName
  );
  if (entry)
    await set(ref(db, `games/${gameId}/players/${entry[0]}/ready`), ready);
};

export const processDonations = async (gameId) => {
  const gameRef = ref(db, `games/${gameId}`);
  const snap = await get(gameRef);
  if (!snap.exists()) return false;
  const { players, donations = {}, day } = snap.val();
  const dayKey = `day${day}`;
  const updated = { ...players };

  if (donations[dayKey]) {
    Object.entries(donations[dayKey]).forEach(([donorName, recips]) => {
      const donorKey = findKey(players, donorName);
      let total = 0;
      Object.entries(recips).forEach(([recipName, { amount = 0 }]) => {
        const val = Number(amount);
        total += val;
        const recipKey = findKey(players, recipName);
        if (recipKey) updated[recipKey].money += val * 3;
      });
      if (donorKey) updated[donorKey].money -= total;
    });
  }

  Object.values(updated).forEach((p) => {
    p.money += 100;
    p.ready = false;
  });

  if (day < 3) {
    await update(ref(db), {
      [`games/${gameId}/players`]: updated,
      [`games/${gameId}/day`]: day + 1,
    });
  } else {
    const victory = Object.values(updated).every((p) => p.money >= 1000);
    await update(ref(db), {
      [`games/${gameId}/players`]: updated,
      [`games/${gameId}/status`]: "completed",
      [`games/${gameId}/result`]: victory ? "victory" : "defeat",
    });
  }
  return true;
};

/* 6️⃣  DEV / TEST -------------------------------------------------- */
export const testAddPlayer = (gameId, name) =>
  push(ref(db, `games/${gameId}/players`)).then((r) =>
    set(r, { name, money: 100, isHost: false, ready: false })
  );
export const improvedTestAddPlayer = testAddPlayer;
export const testFirebaseConnection = async () => {
  const snap = await get(ref(db, ".info/connected"));
  return !!snap.val();
};

/* diagnostic helper */
export const debugDatabase = async (gameId) => {
  const id = gameId.trim().toUpperCase();
  const snap = await get(ref(db, `games/${id}`));
  if (!snap.exists()) {
    console.error(`❌ Game ${id} not found`);
    return null;
  }
  console.log(`📊 DEBUG – game ${id}:`, JSON.stringify(snap.val(), null, 2));
  return snap.val();
};

/* 7️⃣  UTIL -------------------------------------------------------- */
const findKey = (players, name) =>
  Object.entries(players).find(([, p]) => p.name === name)?.[0];
