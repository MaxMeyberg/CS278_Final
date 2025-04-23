import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your Firebase configuration
// Replace these placeholder values with the actual values from your Firebase project
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",  // Get from Firebase console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const database = getDatabase(app);
const auth = getAuth(app);

// Export Firebase services and functions for use in other files
export { 
  app,          // Firebase app instance
  database,     // Realtime Database instance
  auth,         // Authentication instance
  ref,          // Function to create database references
  onValue,      // Function to listen for value changes
  set,          // Function to write data
  get,          // Function to read data once
  signInAnonymously  // Function for anonymous authentication
};