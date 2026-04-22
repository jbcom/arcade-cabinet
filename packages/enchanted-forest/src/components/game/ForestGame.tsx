import { GameViewport } from "@arcade-cabinet/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyShadowHit,
  applySpellCast,
  type CorruptionShadow,
  clearHealing,
  clearPurifyZone,
  clearRuneFeedback,
  clearShield,
  createInitialForestState,
  getForestTransition,
  MAX_WAVES,
  regenerateMana,
  removePurifiedShadow,
  spawnCorruptionWave,
  TREE_POSITIONS,
} from "../../engine/forestSimulation";
import { forestAudio } from "../../lib/forestAudio";
import type { RunePattern } from "../../lib/runePatterns";
import { CorruptionWave } from "./CorruptionWave";
import { FireflyParticles } from "./FireflyParticles";
import { GameUI } from "./GameUI";
import { GroveStage } from "./GroveStage";
import { ForestGradientBackground, NoiseBackground } from "./NoiseBackground";
import { SacredTree } from "./SacredTree";
import { Spirit } from "./Spirit";
import { ToneDrawer } from "./ToneDrawer";

export function ForestGame() {
  const [forestState, setForestState] = useState(createInitialForestState);
  const [isDrawing, setIsDrawing] = useState(false);
  const [spiritPos, setSpiritPos] = useState({ x: 0, y: 0 });
  const shadowIdRef = useRef(0);

  const spawnWave = useCallback((waveNum: number) => {
    const wave = spawnCorruptionWave(waveNum, shadowIdRef.current);
    shadowIdRef.current = wave.nextShadowId;
    forestAudio.playWaveStart(waveNum);
    setForestState((prev) => ({
      ...prev,
      wave: waveNum,
      shadows: wave.shadows,
      objective: `Wave ${waveNum} is entering the ward line. Draw before it reaches the roots.`,
      threatLevel: Math.min(100, wave.shadows.length * 7),
    }));
  }, []);

  const startGame = async () => {
    await forestAudio.initialize();
    forestAudio.startAmbient();
    const wave = spawnCorruptionWave(1, 0);
    shadowIdRef.current = wave.nextShadowId;
    forestAudio.playWaveStart(1);
    setForestState({
      ...createInitialForestState("playing"),
      shadows: wave.shadows,
      threatLevel: wave.shadows.length * 7,
    });
  };

  const restartGame = () => {
    forestAudio.stopAmbient();
    shadowIdRef.current = 0;
    setForestState(createInitialForestState());
  };

  useEffect(() => {
    if (forestState.phase !== "playing") return undefined;

    const manaRegen = setInterval(() => {
      setForestState((prev) => regenerateMana(prev));
    }, 1000);

    return () => clearInterval(manaRegen);
  }, [forestState.phase]);

  useEffect(() => {
    if (forestState.phase === "playing") {
      const avgHealth =
        forestState.trees.reduce((sum, tree) => sum + tree.health, 0) / forestState.trees.length;
      forestAudio.updateTreeHealth(avgHealth);
    }
  }, [forestState.phase, forestState.trees]);

  const handleSpellCast = (spell: RunePattern) => {
    if (forestState.mana < spell.manaCost || forestState.phase !== "playing") return;

    forestAudio.playSpellEffect(spell.type);
    setForestState((prev) => applySpellCast(prev, spell));
    setTimeout(() => setForestState((prev) => clearRuneFeedback(prev)), 1000);

    if (spell.type === "shield") {
      setTimeout(() => setForestState((prev) => clearShield(prev)), spell.duration);
    } else if (spell.type === "heal") {
      setTimeout(() => setForestState((prev) => clearHealing(prev)), 1000);
    } else if (spell.type === "purify") {
      setTimeout(() => setForestState((prev) => clearPurifyZone(prev)), spell.duration);
    }
  };

  const handleShadowReach = (shadowId: number, treeIndex: number) => {
    forestAudio.playCorruptionThreat();
    setForestState((prev) => applyShadowHit(prev, shadowId, treeIndex));
  };

  const handleShadowPurified = (shadowId: number) => {
    setForestState((prev) => removePurifiedShadow(prev, shadowId));
  };

  useEffect(() => {
    const transition = getForestTransition(forestState, MAX_WAVES);

    if (transition.type === "next-wave" && transition.nextWave) {
      spawnWave(transition.nextWave);
    } else if (transition.type === "victory") {
      forestAudio.playSpellEffect("victory");
      setForestState((prev) => ({ ...prev, phase: "victory", objective: "The grove is sealed." }));
    } else if (transition.type === "defeat") {
      forestAudio.playSpellEffect("defeat");
      setForestState((prev) => ({
        ...prev,
        phase: "defeat",
        objective: "The grove roots have gone dark.",
      }));
    }
  }, [forestState, spawnWave]);

  return (
    <GameViewport
      className="bg-emerald-950"
      background="#064e3b"
      data-browser-screenshot-mode="page"
    >
      <ForestGradientBackground />
      <GroveStage threatLevel={forestState.threatLevel} />
      <NoiseBackground />
      <FireflyParticles count={40} />

      {forestState.trees.map((tree, index) => (
        <SacredTree
          key={TREE_POSITIONS[index].id}
          id={index}
          {...tree}
          position={TREE_POSITIONS[index]}
          isHealing={forestState.healingTreeIndex === index}
          isTargeted={isTreeTargeted(index, forestState.shadows)}
        />
      ))}

      <CorruptionWave
        shadows={forestState.shadows}
        treePositions={TREE_POSITIONS}
        onShadowReachTree={handleShadowReach}
        onShadowPurified={handleShadowPurified}
        isPurifying={!!forestState.purifyZone}
        purifyZone={forestState.purifyZone}
      />

      <ToneDrawer
        onSpellCast={handleSpellCast}
        onDrawingChange={setIsDrawing}
        onPositionChange={setSpiritPos}
        disabled={forestState.phase !== "playing"}
      />
      <Spirit position={spiritPos} isDrawing={isDrawing} />

      <GameUI
        wave={forestState.wave}
        totalWaves={MAX_WAVES}
        mana={forestState.mana}
        maxMana={forestState.maxMana}
        isPaused={false}
        gameState={forestState.phase}
        onStart={startGame}
        onRestart={restartGame}
        lastRune={forestState.lastRune}
        objective={forestState.objective}
        threatLevel={forestState.threatLevel}
      />
    </GameViewport>
  );
}

function isTreeTargeted(treeIndex: number, shadows: CorruptionShadow[]): boolean {
  return shadows.some((shadow) => shadow.targetTreeIndex === treeIndex);
}
