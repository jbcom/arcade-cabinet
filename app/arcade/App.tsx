import { useEffect } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Footer from "./components/Footer";
import GameIsland from "./components/GameIsland";
import GameShowcase from "./components/GameShowcase";
import GamesGrid from "./components/GamesGrid";
import Hero from "./components/Hero";
import TechStack from "./components/TechStack";
import { type GameSlug, getGameBySlug } from "./games/catalog";

export default function ArcadeApp() {
  return (
    <Routes>
      <Route path="/" element={<CabinetHome />} />
      <Route path="/games/:slug" element={<GameRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function CabinetHome() {
  usePageTitle("ARCADE CABINET - Where Games Come Alive");

  return (
    <main>
      <Hero />
      <GamesGrid />
      <GameShowcase />
      <TechStack />
      <Footer />
    </main>
  );
}

function GameRoute() {
  const { slug } = useParams();
  const game = getGameBySlug(slug ?? "");

  usePageTitle(game ? `${game.title} | Arcade Cabinet` : "Arcade Cabinet");

  if (!game) {
    return <Navigate to="/" replace />;
  }

  return (
    <main
      className="fixed inset-0 h-[100svh] w-full overflow-hidden touch-none select-none"
      style={{ background: game.gradient }}
    >
      <Link
        className="fixed left-4 top-4 z-50 border border-slate-700 bg-slate-950/80 px-4 py-2 font-mono text-[0.7rem] uppercase text-slate-200 backdrop-blur transition hover:border-cyan-400 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        to="/#games"
      >
        Cabinet
      </Link>
      <GameIsland slug={game.slug as GameSlug} />
    </main>
  );
}

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
