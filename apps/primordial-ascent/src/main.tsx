import React from "react";
import ReactDOM from "react-dom/client";
import Game from "@arcade-cabinet/primordial-ascent";
import "@arcade-cabinet/shared/src/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
