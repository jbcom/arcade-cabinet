import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ArcadeApp from "./arcade/App";
import "@app/shared/styles/globals.css";

const redirectPath = window.sessionStorage.getItem("arcade-cabinet:redirect");
if (redirectPath) {
  window.sessionStorage.removeItem("arcade-cabinet:redirect");
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const nextPath =
    normalizedBase && redirectPath.startsWith(normalizedBase)
      ? redirectPath.slice(normalizedBase.length) || "/"
      : redirectPath;
  window.history.replaceState(null, "", `${base}${nextPath.replace(/^\//, "")}`);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const basename = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL;

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ArcadeApp />
    </BrowserRouter>
  </StrictMode>
);
