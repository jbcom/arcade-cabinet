import React from "react";
import ReactDOM from "react-dom/client";
import Game from "@arcade-cabinet/cosmic-gardener";
import "@arcade-cabinet/shared/src/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game className="w-screen h-screen" />
  </React.StrictMode>
);
