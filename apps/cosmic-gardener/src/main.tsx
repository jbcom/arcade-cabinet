import Game from "@arcade-cabinet/cosmic-gardener";
import React from "react";
import ReactDOM from "react-dom/client";
import "@arcade-cabinet/shared/src/styles/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Game className="w-screen h-screen" />
  </React.StrictMode>
);
