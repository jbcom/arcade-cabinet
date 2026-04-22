import { useResponsive } from "@arcade-cabinet/shared";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  generateVoidZones,
  getConstellationForLevel,
  type VoidZone as VoidZoneType,
} from "./engine/constellations";
import { useEnergyRouting } from "./engine/useEnergyRouting";
import { usePinballPhysics } from "./engine/usePinballPhysics";
import { cn } from "./lib/utils";
import { BallLauncher } from "./ui/BallLauncher";
import { ConstellationPattern } from "./ui/ConstellationPattern";
import { CosmicDust } from "./ui/CosmicDust";
import { EnergyStream } from "./ui/EnergyStream";
import { Flippers } from "./ui/Flippers";
import { GameUI } from "./ui/GameUI";
import { NebulaBackground } from "./ui/NebulaBackground";
import { PinballOrb } from "./ui/PinballOrb";
import { StarSeed } from "./ui/StarSeed";
import { VoidZone } from "./ui/VoidZone";

type GameState =
  | "intro"
  | "tutorial"
  | "playing"
  | "paused"
  | "levelComplete"
  | "gameOver"
  | "zenMode";

export default function Game({ className }: { className?: string }) {
  const _viewport = useResponsive();
  const [gameState, setGameState] = useState<GameState>("intro");
  const [level, setLevel] = useState(1);
  const [constellationsCompleted, setConstellationsCompleted] = useState(0);
  const [voidZones, setVoidZones] = useState<VoidZoneType[]>([]);
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const [completedPoints, setCompletedPoints] = useState<Set<string>>(new Set());
  const [completedConnections, setCompletedConnections] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [ballsRemaining, setBallsRemaining] = useState(3);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [showHitEffect, setShowHitEffect] = useState<{
    x: number;
    y: number;
    points: number;
  } | null>(null);

  const gardenRef = useRef<HTMLDivElement>(null);

  const handleConstellationComplete = useCallback(() => {
    setConstellationsCompleted((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setGameState("zenMode");
      } else {
        setGameState("levelComplete");
      }
      return newCount;
    });
    setScore((prev) => prev + 5000 * comboMultiplier);
  }, [comboMultiplier]);

  const handleEnergyDepleted = useCallback(() => {
    if (gameState === "playing" && ballsRemaining <= 0) {
      setGameState("gameOver");
    }
  }, [gameState, ballsRemaining]);

  const {
    stars,
    streams,
    totalEnergy,
    cosmicCold,
    plantSeed,
    createStream,
    transferEnergy,
    resetGame,
  } = useEnergyRouting({
    onConstellationComplete: handleConstellationComplete,
    onEnergyDepleted: handleEnergyDepleted,
  });

  const starsForPhysics = new Map(
    Array.from(stars.entries()).map(([id, star]) => [
      id,
      { id: star.id, x: star.x, y: star.y, energy: star.energy, growthStage: star.growthStage },
    ])
  );

  const handleStarHit = useCallback(
    (starId: string) => {
      const star = stars.get(starId);
      if (!star) return;

      transferEnergy(starId, 5);

      const now = Date.now();
      if (now - lastHitTime < 2000) {
        setComboMultiplier((prev) => Math.min(prev + 0.5, 5));
      } else {
        setComboMultiplier(1);
      }
      setLastHitTime(now);

      const basePoints = 100 * (star.growthStage + 1);
      const points = Math.floor(basePoints * comboMultiplier);
      setScore((prev) => prev + points);

      setShowHitEffect({ x: star.x, y: star.y, points });
      setTimeout(() => setShowHitEffect(null), 800);
    },
    [stars, transferEnergy, lastHitTime, comboMultiplier]
  );

  const handleDrain = useCallback(() => {
    setBallsRemaining((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setGameState("gameOver");
      }
      return Math.max(0, newCount);
    });
    setComboMultiplier(1);
  }, []);

  const {
    orbs,
    leftFlipper,
    rightFlipper,
    launchOrb,
    activateLeftFlipper,
    deactivateLeftFlipper,
    activateRightFlipper,
    deactivateRightFlipper,
  } = usePinballPhysics({
    stars: starsForPhysics,
    onStarHit: handleStarHit,
    onDrain: handleDrain,
    bounds: { width: 100, height: 100 },
  });

  const currentPattern = getConstellationForLevel(level);

  useEffect(() => {
    if (gameState === "playing") {
      setVoidZones(generateVoidZones(level));
    }
  }, [level, gameState]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameState !== "playing" && gameState !== "tutorial" && gameState !== "zenMode") return;
      if (isDragging) return;

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (y > 82) return;

      const clickedStar = Array.from(stars.values()).find((star) => {
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (clickedStar) {
        if (selectedStarId && selectedStarId !== clickedStar.id) {
          createStream(selectedStarId, clickedStar.id);
          setSelectedStarId(null);
        } else {
          setSelectedStarId(clickedStar.id === selectedStarId ? null : clickedStar.id);
        }
      } else {
        const newStarId = plantSeed(x, y);
        if (newStarId) {
          setSelectedStarId(null);
          currentPattern.points.forEach((point) => {
            const dx = point.x - x;
            const dy = point.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < 8) {
              setCompletedPoints((prev) => new Set([...prev, point.id]));
            }
          });
        }
      }
    },
    [gameState, isDragging, selectedStarId, stars, plantSeed, createStream, currentPattern]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (gameState !== "playing" && gameState !== "zenMode") return;

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clickedStar = Array.from(stars.values()).find((star) => {
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (clickedStar) {
        setIsDragging(true);
        setDragStart({ x, y });
        setSelectedStarId(clickedStar.id);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [gameState, stars]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setDragEnd({ x, y });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !selectedStarId) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        return;
      }

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const targetStar = Array.from(stars.values()).find((star) => {
        if (star.id === selectedStarId) return false;
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (targetStar) {
        createStream(selectedStarId, targetStar.id);
        currentPattern.connections.forEach((conn) => {
          if (
            (conn.from === selectedStarId && conn.to === targetStar.id) ||
            (conn.from === targetStar.id && conn.to === selectedStarId)
          ) {
            const key = `${conn.from}-${conn.to}`;
            setCompletedConnections((prev) => new Set([...prev, key]));
          }
        });
      }

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setSelectedStarId(null);
    },
    [isDragging, selectedStarId, stars, createStream, currentPattern]
  );

  const handleLaunch = useCallback(
    (x: number, y: number, angle: number, power: number) => {
      if (orbs.size < 3) {
        launchOrb(x, y, angle, power);
      }
    },
    [orbs.size, launchOrb]
  );

  const startGame = () => {
    resetGame();
    setLevel(1);
    setConstellationsCompleted(0);
    setCompletedPoints(new Set());
    setCompletedConnections(new Set());
    setScore(0);
    setBallsRemaining(3);
    setComboMultiplier(1);
    setGameState("tutorial");
  };

  const startPlaying = () => {
    setGameState("playing");
  };

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setCompletedPoints(new Set());
    setCompletedConnections(new Set());
    setBallsRemaining((prev) => Math.min(prev + 1, 5));
    resetGame();
    setGameState("playing");
  };

  return (
    <div
      ref={gardenRef}
      className={cn(
        "relative w-full h-[100svh] overflow-hidden bg-[#0c0a1a] touch-none select-none",
        className
      )}
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <NebulaBackground />
      <CosmicDust particleCount={150} />

      {(gameState === "playing" || gameState === "zenMode") && (
        <ConstellationPattern
          pattern={currentPattern}
          completedPoints={completedPoints}
          completedConnections={completedConnections}
        />
      )}

      <AnimatePresence>
        {gameState === "playing" &&
          voidZones.map((zone, index) => <VoidZone key={`void-${index}`} zone={zone} />)}
      </AnimatePresence>

      {Array.from(streams.values()).map((stream) => {
        const fromStar = stars.get(stream.fromId);
        const toStar = stars.get(stream.toId);
        if (!fromStar || !toStar) return null;

        return (
          <EnergyStream
            key={stream.id}
            fromX={fromStar.x}
            fromY={fromStar.y}
            toX={toStar.x}
            toY={toStar.y}
            flowRate={stream.flowRate}
            active={stream.active}
          />
        );
      })}

      {isDragging && dragStart && dragEnd && selectedStarId && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
          <line
            x1={`${dragStart.x}%`}
            y1={`${dragStart.y}%`}
            x2={`${dragEnd.x}%`}
            y2={`${dragEnd.y}%`}
            stroke="rgba(251, 191, 36, 0.5)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
        </svg>
      )}

      <AnimatePresence>
        {Array.from(stars.values()).map((star) => (
          <StarSeed
            key={star.id}
            {...star}
            isSelected={star.id === selectedStarId}
            onClick={() => {}}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {Array.from(orbs.values()).map((orb) => (
          <PinballOrb key={orb.id} orb={orb} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showHitEffect && (
          <motion.div
            className="absolute pointer-events-none z-50 text-amber-400 font-bold text-lg"
            style={{
              left: `${showHitEffect.x}%`,
              top: `${showHitEffect.y}%`,
              transform: "translate(-50%, -50%)",
              textShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
            }}
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            +{showHitEffect.points}
          </motion.div>
        )}
      </AnimatePresence>

      {(gameState === "playing" || gameState === "zenMode") && (
        <Flippers
          leftActive={leftFlipper}
          rightActive={rightFlipper}
          onLeftDown={activateLeftFlipper}
          onLeftUp={deactivateLeftFlipper}
          onRightDown={activateRightFlipper}
          onRightUp={deactivateRightFlipper}
        />
      )}

      {(gameState === "playing" || gameState === "zenMode") && (
        <BallLauncher onLaunch={handleLaunch} disabled={orbs.size >= 3} />
      )}

      {(gameState === "playing" || gameState === "paused" || gameState === "zenMode") && (
        <>
          <GameUI
            level={level}
            totalEnergy={totalEnergy}
            cosmicCold={cosmicCold}
            constellationsCompleted={constellationsCompleted}
            totalConstellations={5}
            isPaused={gameState === "paused"}
            onPause={() => setGameState("paused")}
            onResume={() => setGameState("playing")}
            onRestart={startGame}
          />

          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-3xl font-light text-white tabular-nums">
              {score.toLocaleString()}
            </div>
            {comboMultiplier > 1 && (
              <motion.div
                className="text-amber-400 text-sm"
                key={comboMultiplier}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                x{comboMultiplier.toFixed(1)} COMBO
              </motion.div>
            )}
          </motion.div>

          <div className="absolute top-4 right-20 flex gap-1 pointer-events-none z-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  i < ballsRemaining
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "bg-white/10"
                )}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {gameState === "intro" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-light text-white mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Cosmic Gardener
              </motion.h1>
              <motion.p
                className="text-white/40 text-sm mb-12 max-w-md mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Plant your stars. Build your table. Keep the cosmic ball alive.
              </motion.p>
              <motion.button
                className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium text-lg hover:from-amber-400 hover:to-pink-400 transition-all shadow-lg shadow-pink-500/20"
                onClick={startGame}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Begin the Journey
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "tutorial" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center max-w-lg mx-auto px-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-3xl font-light text-white mb-8">The Amazing Journey</h2>

              <div className="space-y-6 text-left mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Plant Your Stars</h3>
                    <p className="text-white/60 text-sm">
                      Tap to plant bumper stars. They're your targets and your table.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Launch & Flip</h3>
                    <p className="text-white/60 text-sm">
                      Hold the plunger to charge, release to launch. Use Z and / for flippers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Grow Constellations</h3>
                    <p className="text-white/60 text-sm">
                      Hit stars to charge them. Connect charged stars to complete patterns.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                className="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                onClick={startPlaying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Ball
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "levelComplete" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-4xl font-light text-white mb-4">Constellation Complete!</h2>
              <p className="text-white/60 mb-2">{currentPattern.name} has awakened</p>
              <p className="text-amber-400 text-2xl mb-2">{score.toLocaleString()} points</p>
              <p className="text-white/40 text-sm mb-8">
                {constellationsCompleted} of 5 constellations cultivated
              </p>
              <motion.button
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:from-amber-400 hover:to-pink-400 transition-all"
                onClick={nextLevel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next Constellation
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "gameOver" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-4xl font-light text-white mb-4">Game Over</h2>
              <p className="text-amber-400 text-3xl mb-2">{score.toLocaleString()}</p>
              <p className="text-white/60 mb-2">Final Score</p>
              <motion.button
                className="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
