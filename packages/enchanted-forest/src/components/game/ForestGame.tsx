import { GameViewport, useResponsive } from "@arcade-cabinet/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { forestAudio } from "../../lib/forestAudio";
import type { RunePattern } from "../../lib/runePatterns";
import { type CorruptionShadow, CorruptionWave } from "./CorruptionWave";
import { FireflyParticles } from "./FireflyParticles";
import { GameUI } from "./GameUI";
import { ForestGradientBackground, NoiseBackground } from "./NoiseBackground";
import { SacredTree } from "./SacredTree";
import { Spirit } from "./Spirit";
import { ToneDrawer } from "./ToneDrawer";

const MAX_WAVES = 5;
const TREE_POSITIONS = [
  { id: "left-grove", x: 30, y: 70 },
  { id: "heart-tree", x: 50, y: 75 },
  { id: "right-grove", x: 70, y: 70 },
];

export function ForestGame() {
  const _viewport = useResponsive();
  const [gameState, setGameState] = useState<"intro" | "playing" | "victory" | "defeat">("intro");
  const [wave, setWave] = useState(1);
  const [mana, setMana] = useState(100);
  const [trees, setTrees] = useState(
    TREE_POSITIONS.map(() => ({ health: 100, maxHealth: 100, isShielded: false }))
  );
  const [shadows, setShadows] = useState<CorruptionShadow[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [spiritPos, setSpiritPos] = useState({ x: 0, y: 0 });
  const [lastRune, setLastRune] = useState<string | null>(null);
  const [purifyZone, setPurifyZone] = useState<{ x: number; y: number; radius: number } | null>(
    null
  );
  const [healingTreeIndex, setHealingTreeIndex] = useState<number | null>(null);

  const shadowIdRef = useRef(0);

  const startGame = async () => {
    await forestAudio.initialize();
    forestAudio.startAmbient();
    setGameState("playing");
    spawnWave(1);
  };

  const spawnWave = useCallback((waveNum: number) => {
    const newShadows: CorruptionShadow[] = Array.from({ length: waveNum * 3 }, (_, _i) => ({
      id: shadowIdRef.current++,
      x: 10 + Math.random() * 80,
      y: -10 - Math.random() * 20,
      targetTreeIndex: Math.floor(Math.random() * 3),
      health: 20,
      maxHealth: 20,
      speed: 0.5 + waveNum * 0.1,
      size: 30 + Math.random() * 20,
    }));
    setShadows(newShadows);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      const manaRegen = setInterval(() => setMana((m) => Math.min(100, m + 1)), 1000);
      return () => clearInterval(manaRegen);
    }
    return undefined;
  }, [gameState]);

  const handleSpellCast = (spell: RunePattern) => {
    if (mana < spell.manaCost) return;
    setMana((m) => m - spell.manaCost);
    setLastRune(spell.name);
    setTimeout(() => setLastRune(null), 1000);

    if (spell.type === "shield") {
      setTrees((prev) => prev.map((t) => ({ ...t, isShielded: true })));
      setTimeout(
        () => setTrees((prev) => prev.map((t) => ({ ...t, isShielded: false }))),
        spell.duration
      );
    } else if (spell.type === "heal") {
      setTrees((prev) => prev.map((t) => ({ ...t, health: Math.min(t.maxHealth, t.health + 20) })));
      setHealingTreeIndex(1); // Visual simplification
      setTimeout(() => setHealingTreeIndex(null), 1000);
    } else if (spell.type === "purify") {
      setPurifyZone({ x: 50, y: 50, radius: 30 });
      setTimeout(() => setPurifyZone(null), spell.duration);
    }
  };

  const handleShadowReach = (shadowId: number, treeIndex: number) => {
    setTrees((prev) => {
      const next = [...prev];
      if (!next[treeIndex].isShielded) {
        next[treeIndex].health = Math.max(0, next[treeIndex].health - 10);
      }
      return next;
    });
    setShadows((prev) => prev.filter((s) => s.id !== shadowId));
  };

  useEffect(() => {
    if (gameState === "playing" && shadows.length === 0 && wave < MAX_WAVES) {
      setWave((w) => w + 1);
      spawnWave(wave + 1);
    } else if (gameState === "playing" && shadows.length === 0 && wave === MAX_WAVES) {
      setGameState("victory");
    }
    if (trees.every((t) => t.health <= 0)) setGameState("defeat");
  }, [shadows, trees, wave, gameState, spawnWave]);

  return (
    <GameViewport className="bg-emerald-950" background="#064e3b">
      <ForestGradientBackground />
      <NoiseBackground />
      <FireflyParticles count={40} />

      {trees.map((tree, i) => (
        <SacredTree
          key={TREE_POSITIONS[i].id}
          id={i}
          {...tree}
          position={TREE_POSITIONS[i]}
          isHealing={healingTreeIndex === i}
        />
      ))}

      <CorruptionWave
        shadows={shadows}
        treePositions={TREE_POSITIONS}
        onShadowReachTree={handleShadowReach}
        isPurifying={!!purifyZone}
        purifyZone={purifyZone}
      />

      <ToneDrawer
        onSpellCast={handleSpellCast}
        onDrawingChange={setIsDrawing}
        onPositionChange={setSpiritPos}
      />
      <Spirit position={spiritPos} isDrawing={isDrawing} />

      <GameUI
        wave={wave}
        totalWaves={MAX_WAVES}
        mana={mana}
        maxMana={100}
        isPaused={false}
        gameState={gameState}
        onStart={startGame}
        onRestart={() => window.location.reload()}
        lastRune={lastRune}
      />
    </GameViewport>
  );
}
