import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App"; // Restore App import

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  // <h1>Test Render</h1> // Remove the test render
);
