import Game from "@arcade-cabinet/reach-for-the-sky";
import React from "react";
import ReactDOM from "react-dom/client";
import "@arcade-cabinet/shared/src/styles/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
