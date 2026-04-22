import {
  applySettingsToDocument,
  CabinetErrorBoundary,
  CabinetMenuButton,
  CabinetPauseMenu,
  useCabinetRuntime,
} from "@app/shared";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import ArcadeGallery from "./components/ArcadeGallery";
import Footer from "./components/Footer";
import GameIsland from "./components/GameIsland";
import GamesGrid from "./components/GamesGrid";
import Hero from "./components/Hero";
import { type GameSlug, getGameBySlug } from "./games/catalog";

export default function ArcadeApp() {
  useEffect(() => {
    applySettingsToDocument();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<CabinetHome />} />
      <Route path="/games/:slug" element={<GameRoute />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function CabinetHome() {
  usePageTitle("ARCADE CABINET - Where Games Come Alive");

  return (
    <main>
      <Hero />
      <ArcadeGallery />
      <GamesGrid />
      <Footer />
    </main>
  );
}

function GameRoute() {
  const { slug } = useParams();
  const game = getGameBySlug(slug ?? "");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const { clearRun, saveSlot, setSettings, settings } = useCabinetRuntime(game?.slug);

  usePageTitle(game ? `${game.title} | Arcade Cabinet` : "Arcade Cabinet");

  if (!game) {
    return <Navigate to="/" replace />;
  }

  const returnToCabinet = () => {
    setMenuOpen(false);
    navigate({ hash: "games", pathname: "/" });
  };

  return (
    <main
      className="fixed inset-0 h-[100svh] w-full overflow-hidden touch-none select-none"
      style={{ background: game.gradient }}
    >
      <CabinetMenuButton onClick={() => setMenuOpen(true)} />
      <CabinetPauseMenu
        gameTitle={game.title}
        open={menuOpen}
        rules={[game.coreLoop, game.defaultControls, game.winReplayPromise]}
        saveSlot={saveSlot}
        settings={settings}
        onCabinet={returnToCabinet}
        onClose={() => setMenuOpen(false)}
        onQuitRun={() => {
          clearRun();
          returnToCabinet();
        }}
        onRestart={() => {
          clearRun();
          setRestartKey((current) => current + 1);
          setMenuOpen(false);
        }}
        onSettingsChange={setSettings}
      />
      <CabinetErrorBoundary
        boundaryKey={`${game.slug}:${restartKey}`}
        onReturnToCabinet={returnToCabinet}
      >
        <GameIsland key={`${game.slug}:${restartKey}`} slug={game.slug as GameSlug} />
      </CabinetErrorBoundary>
    </main>
  );
}

function PrivacyPolicy() {
  usePageTitle("Privacy | Arcade Cabinet");

  return (
    <main className="min-h-[100svh] bg-slate-950 px-5 py-10 text-slate-100">
      <section className="mx-auto grid max-w-3xl gap-5">
        <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.24em] text-cyan-200/72">
          Arcade Cabinet
        </p>
        <h1 className="font-display text-4xl font-black uppercase">Privacy</h1>
        <p className="leading-relaxed text-slate-300">
          Arcade Cabinet 1.0 is designed as a local-only game cabinet. It has no accounts, ads,
          analytics, in-app purchases, leaderboards, cloud saves, or network telemetry.
        </p>
        <div className="grid gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em]">
            Local Game Data
          </h2>
          <p className="leading-relaxed text-slate-300">
            Settings, best scores, selected session mode, and one active run per cartridge are saved
            only on this device through browser or WebView storage. Removing app data removes this
            local progress.
          </p>
        </div>
        <Link
          className="w-fit rounded-md border border-cyan-300/38 bg-cyan-300/10 px-4 py-3 font-mono text-[0.7rem] font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-300/16"
          to="/#games"
        >
          Return To Cabinet
        </Link>
      </section>
    </main>
  );
}

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
