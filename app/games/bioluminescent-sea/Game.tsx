import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  type SessionMode,
} from "@app/shared";
import {
  advanceScene,
  type Creature,
  createInitialScene,
  type DiveTelemetry,
  getDiveDurationSeconds,
  getDiveRunSummary,
  getDiveTelemetry,
  isDiveComplete,
  type Particle,
  type Pirate,
  type Player,
  type Predator,
  type SceneState,
} from "@logic/games/bioluminescent-sea/engine/deepSeaSimulation";
import { useGameLoop } from "@logic/games/bioluminescent-sea/hooks/useGameLoop";
import { useTouchInput } from "@logic/games/bioluminescent-sea/hooks/useTouchInput";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

interface CollectionBurst {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  startedAt: number;
}

function drawCreature(ctx: CanvasRenderingContext2D, creature: Creature) {
  ctx.save();
  ctx.translate(creature.x, creature.y);
  ctx.rotate(Math.sin(creature.pulsePhase * 0.45) * 0.16);

  const glowSize = creature.size * (2.2 + creature.glowIntensity);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
  glow.addColorStop(0, `${creature.glowColor}88`);
  glow.addColorStop(0.4, `${creature.glowColor}30`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

  if (creature.type === "jellyfish") {
    drawJellyfish(ctx, creature);
  } else if (creature.type === "plankton") {
    drawPlanktonCluster(ctx, creature);
  } else {
    drawGlowFish(ctx, creature);
  }

  ctx.restore();
}

function drawJellyfish(ctx: CanvasRenderingContext2D, creature: Creature) {
  const bellGradient = ctx.createLinearGradient(0, -creature.size * 0.65, 0, creature.size * 0.4);
  bellGradient.addColorStop(0, "#e0f7ff");
  bellGradient.addColorStop(0.45, creature.color);
  bellGradient.addColorStop(1, `${creature.glowColor}88`);
  ctx.fillStyle = bellGradient;
  ctx.beginPath();
  ctx.ellipse(0, -creature.size * 0.08, creature.size * 0.52, creature.size * 0.42, 0, Math.PI, 0);
  ctx.quadraticCurveTo(creature.size * 0.42, creature.size * 0.42, 0, creature.size * 0.36);
  ctx.quadraticCurveTo(
    -creature.size * 0.42,
    creature.size * 0.42,
    -creature.size * 0.52,
    -creature.size * 0.08
  );
  ctx.fill();

  ctx.strokeStyle = `${creature.glowColor}cc`;
  ctx.lineWidth = Math.max(1.4, creature.size * 0.055);
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const offset = (i - 2.5) * creature.size * 0.14;
    const sway = Math.sin(creature.pulsePhase + i) * creature.size * 0.11;
    ctx.beginPath();
    ctx.moveTo(offset, creature.size * 0.24);
    ctx.bezierCurveTo(
      offset + sway,
      creature.size * 0.55,
      offset - sway,
      creature.size * 0.78,
      offset + sway * 0.45,
      creature.size * 1.02
    );
    ctx.stroke();
  }
}

function drawPlanktonCluster(ctx: CanvasRenderingContext2D, creature: Creature) {
  ctx.strokeStyle = `${creature.glowColor}66`;
  ctx.lineWidth = 1;

  for (let i = 0; i < 7; i++) {
    const angle = creature.pulsePhase + i * 1.17;
    const radius = creature.size * (0.12 + (i % 3) * 0.1);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle * 0.85) * radius;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = i % 2 === 0 ? creature.color : "#fef9c3";
    ctx.beginPath();
    ctx.arc(x, y, creature.size * (0.08 + (i % 2) * 0.035), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ecfeff";
  ctx.beginPath();
  ctx.arc(0, 0, creature.size * 0.13, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlowFish(ctx: CanvasRenderingContext2D, creature: Creature) {
  const direction = creature.noiseOffsetX % 2 === 0 ? 1 : -1;
  ctx.scale(direction, 1);
  ctx.fillStyle = creature.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, creature.size * 0.58, creature.size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `${creature.glowColor}dd`;
  ctx.beginPath();
  ctx.moveTo(-creature.size * 0.5, 0);
  ctx.lineTo(-creature.size * 0.92, -creature.size * 0.28);
  ctx.lineTo(-creature.size * 0.82, creature.size * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fdf2f8";
  ctx.beginPath();
  ctx.moveTo(-creature.size * 0.05, -creature.size * 0.25);
  ctx.lineTo(creature.size * 0.18, -creature.size * 0.48);
  ctx.lineTo(creature.size * 0.32, -creature.size * 0.13);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(creature.size * 0.28, -creature.size * 0.07, creature.size * 0.055, 0, Math.PI * 2);
  ctx.fill();
}

function drawPredator(ctx: CanvasRenderingContext2D, predator: Predator) {
  ctx.save();
  ctx.translate(predator.x, predator.y);
  ctx.rotate(predator.angle);

  const size = predator.size;
  const shadow = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.9);
  shadow.addColorStop(0, "#111827");
  shadow.addColorStop(0.7, "#030712");
  shadow.addColorStop(1, "transparent");
  ctx.fillStyle = shadow;
  ctx.fillRect(-size, -size, size * 2, size * 2);

  ctx.fillStyle = "#07111f";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.62, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.moveTo(-size * 0.42, 0);
  ctx.lineTo(-size * 0.92, -size * 0.28);
  ctx.lineTo(-size * 0.8, size * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = Math.max(2, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(size * 0.24, -size * 0.28);
  ctx.quadraticCurveTo(size * 0.34, -size * 0.72, size * 0.58, -size * 0.54);
  ctx.stroke();

  ctx.fillStyle = "#f87171";
  ctx.beginPath();
  ctx.arc(size * 0.36, -size * 0.08, Math.max(3, size * 0.055), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(size * 0.58, -size * 0.54, Math.max(2, size * 0.035), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPirate(ctx: CanvasRenderingContext2D, pirate: Pirate) {
  ctx.save();
  ctx.translate(pirate.x, pirate.y);
  ctx.rotate(pirate.angle);

  const beamAlpha = 0.14 + Math.sin(pirate.lanternPhase) * 0.045;
  const beam = ctx.createLinearGradient(16, 0, 150, 0);
  beam.addColorStop(0, `rgba(251, 191, 36, ${beamAlpha})`);
  beam.addColorStop(1, "rgba(251, 191, 36, 0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(150, -48);
  ctx.lineTo(150, 48);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#122033";
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f3b4d";
  ctx.beginPath();
  ctx.ellipse(-4, -10, 15, 8, 0, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, -2);
  ctx.lineTo(28, -8);
  ctx.stroke();

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(31, -9, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#07111f";
  ctx.beginPath();
  ctx.moveTo(-29, 0);
  ctx.lineTo(-49, -13);
  ctx.lineTo(-44, 13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, scale: number) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  ctx.scale(scale, scale);

  const wideLight = ctx.createLinearGradient(8, 0, 220, 0);
  wideLight.addColorStop(0, `rgba(125, 211, 252, ${0.14 + player.glowIntensity * 0.07})`);
  wideLight.addColorStop(0.42, "rgba(125, 211, 252, 0.1)");
  wideLight.addColorStop(1, "rgba(125, 211, 252, 0)");
  ctx.fillStyle = wideLight;
  ctx.beginPath();
  ctx.moveTo(8, -22);
  ctx.lineTo(228, -86);
  ctx.lineTo(228, 86);
  ctx.lineTo(8, 22);
  ctx.closePath();
  ctx.fill();

  const light = ctx.createLinearGradient(20, 0, 176, 0);
  light.addColorStop(0, `rgba(224, 242, 254, ${0.32 + player.glowIntensity * 0.12})`);
  light.addColorStop(0.55, "rgba(165, 243, 252, 0.16)");
  light.addColorStop(1, "rgba(165, 243, 252, 0)");
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(20, -9);
  ctx.lineTo(184, -56);
  ctx.lineTo(184, 56);
  ctx.lineTo(20, 9);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#35d0c2";
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f766e";
  ctx.beginPath();
  ctx.moveTo(-16, -12);
  ctx.lineTo(-38, -25);
  ctx.lineTo(-31, -4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.lineTo(-38, 25);
  ctx.lineTo(-31, 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ecfeff";
  ctx.beginPath();
  ctx.ellipse(11, -2, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#083344";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(11, -2, 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.arc(31, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneState,
  totalTime: number,
  collectionBursts: CollectionBurst[]
) {
  ctx.clearRect(0, 0, width, height);
  drawBackdrop(ctx, width, height, totalTime);

  scene.particles.forEach((particle) => {
    drawParticle(ctx, particle);
  });

  drawSonarPing(ctx, scene, totalTime);

  scene.creatures.forEach((creature) => {
    drawCreature(ctx, creature);
  });
  collectionBursts.forEach((burst) => {
    drawCollectionBurst(ctx, burst, totalTime);
  });
  scene.predators.forEach((predator) => {
    drawPredator(ctx, predator);
  });
  scene.pirates.forEach((pirate) => {
    drawPirate(ctx, pirate);
  });
  drawPlayer(ctx, scene.player, getViewportScale(width, height));
}

function drawCollectionBurst(
  ctx: CanvasRenderingContext2D,
  burst: CollectionBurst,
  totalTime: number
) {
  const age = totalTime - burst.startedAt;
  if (age < 0 || age > 0.85) return;

  const progress = age / 0.85;
  const alpha = 1 - progress;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `${burst.color}${Math.round(alpha * 210)
    .toString(16)
    .padStart(2, "0")}`;
  ctx.lineWidth = Math.max(1.4, burst.size * 0.08);
  ctx.beginPath();
  ctx.arc(burst.x, burst.y, burst.size * (0.9 + progress * 2.1), 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(254, 249, 195, ${alpha * 0.74})`;
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 8; i++) {
    const angle = i * (Math.PI / 4) + progress * 0.8;
    const inner = burst.size * (0.55 + progress * 1.2);
    const outer = burst.size * (1.15 + progress * 2.8);
    ctx.beginPath();
    ctx.moveTo(burst.x + Math.cos(angle) * inner, burst.y + Math.sin(angle) * inner);
    ctx.lineTo(burst.x + Math.cos(angle) * outer, burst.y + Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSonarPing(ctx: CanvasRenderingContext2D, scene: SceneState, totalTime: number) {
  if (scene.creatures.length === 0) return;

  const nearest = scene.creatures.reduce(
    (best, creature) => {
      const distance = Math.hypot(creature.x - scene.player.x, creature.y - scene.player.y);
      return distance < best.distance ? { creature, distance } : best;
    },
    { creature: scene.creatures[0], distance: Number.POSITIVE_INFINITY }
  );
  const creature = nearest.creature;
  if (!creature) return;

  const pulse = 0.5 + 0.5 * Math.sin(totalTime * 4.2);
  const alpha = Math.max(0.16, 0.42 - nearest.distance / 900);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(scene.player.x, scene.player.y);
  ctx.lineTo(creature.x, creature.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = `rgba(165, 243, 252, ${0.2 + pulse * 0.26})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(scene.player.x, scene.player.y, 54 + pulse * 38, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(251, 191, 36, ${0.32 + pulse * 0.3})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(creature.x, creature.y, creature.size * (1.15 + pulse * 0.4), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  totalTime: number
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#06283c");
  gradient.addColorStop(0.48, "#042035");
  gradient.addColorStop(1, "#020510");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 6; i++) {
    const x = width * (0.08 + i * 0.18) + Math.sin(totalTime * 0.3 + i) * 16;
    const shaft = ctx.createLinearGradient(x, 0, x + width * 0.08, height * 0.86);
    shaft.addColorStop(0, "rgba(125, 211, 252, 0.17)");
    shaft.addColorStop(0.5, "rgba(56, 189, 248, 0.035)");
    shaft.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.035, 0);
    ctx.lineTo(x + width * 0.06, 0);
    ctx.lineTo(x + width * 0.17, height);
    ctx.lineTo(x - width * 0.09, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  drawRidge(ctx, width, height, height * 0.72, height * 0.07, "#071827", 0.2);
  drawRidge(ctx, width, height, height * 0.83, height * 0.09, "#05111f", 1.4);
  drawRidge(ctx, width, height, height * 0.94, height * 0.06, "#020817", 2.2);

  drawDepthSilhouette(ctx, width * 0.2, height * 0.66, 0.72, totalTime, "#062033");
  drawDepthSilhouette(ctx, width * 0.73, height * 0.59, 0.56, totalTime + 2.1, "#071a2b");

  drawCoralFan(ctx, width * 0.1, height * 0.83, 0.9);
  drawCoralFan(ctx, width * 0.82, height * 0.78, 0.72);
  drawCoralFan(ctx, width * 0.62, height * 0.9, 0.56);
}

function drawDepthSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  totalTime: number,
  color: string
) {
  ctx.save();
  ctx.translate(x + Math.sin(totalTime * 0.22) * 8, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 92, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-64, 0);
  ctx.lineTo(-122, -28);
  ctx.lineTo(-112, 24);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(36, -8);
  ctx.lineTo(74, -42);
  ctx.lineTo(64, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRidge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseline: number,
  amplitude: number,
  color: string,
  phase: number
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, baseline);

  for (let i = 0; i <= 12; i++) {
    const x = (width / 12) * i;
    const y =
      baseline +
      Math.sin(i * 0.93 + phase) * amplitude * 0.55 +
      Math.cos(i * 0.47 + phase) * amplitude * 0.4;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

function drawCoralFan(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "rgba(192, 132, 252, 0.3)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (let i = 0; i < 7; i++) {
    const angle = -Math.PI * 0.82 + i * 0.27;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(angle) * 28,
      Math.sin(angle) * 20,
      Math.cos(angle) * 62,
      Math.sin(angle) * 48
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.fillStyle = `rgba(180, 220, 255, ${particle.opacity})`;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
}

function getViewportScale(width: number, height: number) {
  const minDimension = Math.min(width, height);
  return Math.min(1.08, Math.max(0.72, minDimension / 640));
}

function shouldUpdateTelemetry(current: DiveTelemetry, next: DiveTelemetry) {
  return (
    current.objective !== next.objective ||
    current.pressureLabel !== next.pressureLabel ||
    Math.abs(current.collectionRatio - next.collectionRatio) > 0.01 ||
    Math.abs(current.oxygenRatio - next.oxygenRatio) > 0.01 ||
    Math.abs(current.nearestThreatDistance - next.nearestThreatDistance) > 18 ||
    Math.abs(current.nearestBeaconDistance - next.nearestBeaconDistance) > 18 ||
    Math.abs(current.depthMeters - next.depthMeters) > 20 ||
    current.routeLandmarkLabel !== next.routeLandmarkLabel ||
    Math.abs(current.routeLandmarkDistance - next.routeLandmarkDistance) > 14
  );
}

function formatThreatDistance(distance: number) {
  if (!Number.isFinite(distance)) return "--";

  return `${Math.round(distance)}m`;
}

function DeepSeaGame({
  mode,
  onComplete,
  onGameOver,
}: {
  mode: SessionMode;
  onComplete: (score: number) => void;
  onGameOver: (score: number) => void;
}) {
  const durationSeconds = getDiveDurationSeconds(mode);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialSceneRef = useRef<SceneState | null>(null);
  if (!initialSceneRef.current) {
    initialSceneRef.current = createInitialScene({ height: 600, width: 800 });
  }

  const initialScene = initialSceneRef.current;
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [multiplier, setMultiplier] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [telemetry, setTelemetry] = useState<DiveTelemetry>(() =>
    getDiveTelemetry(initialScene, durationSeconds, durationSeconds)
  );

  const playerRef = useRef<Player>(initialScene.player);
  const creaturesRef = useRef<Creature[]>(initialScene.creatures);
  const predatorsRef = useRef<Predator[]>(initialScene.predators);
  const piratesRef = useRef<Pirate[]>(initialScene.pirates);
  const particlesRef = useRef<Particle[]>(initialScene.particles);
  const collectionBurstsRef = useRef<CollectionBurst[]>([]);
  const lastCollectTimeRef = useRef(0);
  const multiplierRef = useRef(1);
  const scoreRef = useRef(0);

  const input = useTouchInput(containerRef);

  useEffect(() => {
    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      setDimensions({
        width: Math.max(320, Math.round(rect?.width ?? window.innerWidth)),
        height: Math.max(320, Math.round(rect?.height ?? window.innerHeight)),
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nextScene = createInitialScene(dimensions);
    playerRef.current = nextScene.player;
    creaturesRef.current = nextScene.creatures;
    predatorsRef.current = nextScene.predators;
    piratesRef.current = nextScene.pirates;
    particlesRef.current = nextScene.particles;
    setTelemetry(getDiveTelemetry(nextScene, durationSeconds, durationSeconds));
  }, [dimensions, durationSeconds]);

  const gameLoop = useCallback(
    (deltaTime: number, totalTime: number) => {
      if (isGameOver) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const { width, height } = dimensions;

      const newTimeLeft = Math.max(0, durationSeconds - Math.floor(totalTime));
      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
        if (newTimeLeft === 0) {
          setIsGameOver(true);
          onGameOver(scoreRef.current);
          return;
        }
      }

      const result = advanceScene(
        {
          creatures: creaturesRef.current,
          particles: particlesRef.current,
          pirates: piratesRef.current,
          player: playerRef.current,
          predators: predatorsRef.current,
        },
        input,
        dimensions,
        totalTime,
        deltaTime,
        lastCollectTimeRef.current,
        multiplierRef.current,
        newTimeLeft,
        mode
      );

      playerRef.current = result.scene.player;
      creaturesRef.current = result.scene.creatures;
      predatorsRef.current = result.scene.predators;
      piratesRef.current = result.scene.pirates;
      particlesRef.current = result.scene.particles;

      if (result.collection.collected.length > 0) {
        collectionBurstsRef.current.push(
          ...result.collection.collected.map((creature) => ({
            color: creature.glowColor,
            id: `${creature.id}-${Math.round(totalTime * 1000)}`,
            size: creature.size,
            startedAt: totalTime,
            x: creature.x,
            y: creature.y,
          }))
        );
        collectionBurstsRef.current = collectionBurstsRef.current.filter(
          (burst) => totalTime - burst.startedAt < 0.95
        );
        multiplierRef.current = result.collection.multiplier;
        lastCollectTimeRef.current = result.collection.lastCollectTime;
        scoreRef.current += result.collection.scoreDelta;
        setMultiplier(result.collection.multiplier);
        setScore(scoreRef.current);
      }

      if (isDiveComplete(result.scene)) {
        setIsGameOver(true);
        onComplete(scoreRef.current);
        return;
      }

      setTelemetry((current) => {
        if (!shouldUpdateTelemetry(current, result.telemetry)) return current;
        return result.telemetry;
      });

      if (result.collidedWithPredator) {
        setIsGameOver(true);
        onGameOver(scoreRef.current);
        return;
      }

      renderScene(ctx, width, height, result.scene, totalTime, collectionBurstsRef.current);
    },
    [dimensions, input, timeLeft, isGameOver, onGameOver, onComplete, durationSeconds, mode]
  );

  useGameLoop(gameLoop, !isGameOver);
  const threatAlert = telemetry.nearestThreatDistance < 180;
  const landmarkAngle = telemetry.routeLandmarkBearingRadians ?? -Math.PI / 5;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden touch-none">
      <canvas
        aria-label="Bioluminescent Sea playfield"
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          background: threatAlert
            ? "radial-gradient(circle at 50% 52%, transparent 48%, rgba(248, 113, 113, 0.26) 100%)"
            : "radial-gradient(circle at 50% 52%, transparent 62%, rgba(14, 165, 233, 0.1) 100%)",
          opacity: threatAlert ? 1 : 0.72,
        }}
      />
      <div className="pointer-events-none absolute inset-x-3 top-3 grid grid-cols-3 gap-2 sm:inset-x-auto sm:left-4 sm:flex sm:gap-3">
        <div className="min-w-0 rounded-md border border-cyan-200/15 bg-slate-950/58 p-2.5 shadow-2xl shadow-cyan-950/30 backdrop-blur-md sm:min-w-28 sm:p-3">
          <div className="mb-1 truncate font-semibold text-[0.62rem] uppercase tracking-widest text-cyan-300">
            Score
          </div>
          <div className="truncate font-black text-xl leading-none text-white sm:text-2xl">
            {score}
          </div>
        </div>
        <div className="min-w-0 rounded-md border border-cyan-200/15 bg-slate-950/58 p-2.5 shadow-2xl shadow-cyan-950/30 backdrop-blur-md sm:min-w-28 sm:p-3">
          <div className="mb-1 truncate font-semibold text-[0.62rem] uppercase tracking-widest text-cyan-300">
            Time
          </div>
          <div className="truncate font-black text-xl leading-none text-white sm:text-2xl">
            {timeLeft}s
          </div>
        </div>
        <div className="min-w-0 rounded-md border border-violet-200/15 bg-slate-950/58 p-2.5 shadow-2xl shadow-violet-950/30 backdrop-blur-md sm:min-w-28 sm:p-3">
          <div className="mb-1 truncate font-semibold text-[0.62rem] uppercase tracking-widest text-violet-300">
            Chain
          </div>
          <div className="truncate font-black text-xl leading-none text-white sm:text-2xl">
            x{multiplier}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:inset-x-4">
        <div className="mx-auto grid max-w-5xl gap-2 rounded-md border border-cyan-100/15 bg-slate-950/60 p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-md sm:grid-cols-[1.35fr_0.9fr_0.85fr_0.75fr] sm:items-end">
          <div className="min-w-0">
            <div className="mb-1 font-semibold text-[0.62rem] uppercase tracking-widest text-cyan-300">
              Dive Plan
            </div>
            <div className="text-balance text-sm font-semibold leading-snug text-white sm:text-base">
              {telemetry.objective}
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center justify-between gap-3 font-semibold text-[0.62rem] uppercase tracking-widest text-cyan-300">
              <span>Oxygen</span>
              <span>{Math.round(telemetry.oxygenRatio * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-cyan-950/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-200"
                style={{ width: `${Math.round(telemetry.oxygenRatio * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-1 sm:text-sm">
            <div className="min-w-0">
              <div className="font-semibold uppercase tracking-widest text-slate-400">Depth</div>
              <div className="truncate font-bold text-white">{telemetry.depthMeters}m</div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold uppercase tracking-widest text-slate-400">Threat</div>
              <div className="truncate font-bold text-white">
                {formatThreatDistance(telemetry.nearestThreatDistance)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold uppercase tracking-widest text-slate-400">Beacon</div>
              <div className="truncate font-bold text-cyan-100">
                {formatThreatDistance(telemetry.nearestBeaconDistance)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold uppercase tracking-widest text-slate-400">Pressure</div>
              <div className="truncate font-bold text-amber-200">{telemetry.pressureLabel}</div>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-cyan-200/10 bg-cyan-950/22 p-2 text-xs sm:text-sm">
            <div
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-full border border-cyan-200/30 bg-cyan-900/35"
            >
              <div
                className="h-4 w-1 rounded-full bg-cyan-100 shadow-[0_0_14px_rgba(165,243,252,0.8)]"
                style={{ transform: `rotate(${landmarkAngle + Math.PI / 2}rad)` }}
              />
            </div>
            <div className="min-w-0">
              <div className="font-semibold uppercase tracking-widest text-slate-400">Route</div>
              <div className="truncate font-bold text-cyan-100">{telemetry.routeLandmarkLabel}</div>
              <div className="truncate text-[0.68rem] font-semibold text-amber-200">
                {formatThreatDistance(telemetry.routeLandmarkDistance)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const [gameState, setGameState] = useState<"landing" | "playing" | "gameover" | "complete">(
    "landing"
  );
  const [sessionMode, setSessionMode] = useState<SessionMode>("standard");
  const [finalScore, setFinalScore] = useState(0);
  const finalSummary = getDiveRunSummary(
    createInitialScene({ height: 600, width: 800 }),
    finalScore,
    0
  );

  return (
    <GameViewport background="#050d15">
      <AnimatePresence mode="wait">
        {gameState === "landing" && (
          <motion.div key="landing" className="absolute inset-0" exit={{ opacity: 0 }}>
            <CartridgeStartScreen
              accent="#4ecdc4"
              cartridgeId="Slot 01"
              description="Descend through a glowing ocean route, collect light, and avoid the dark silhouettes."
              gameSlug="bioluminescent-sea"
              kicker="Deep Sea Cartridge"
              motif="sea"
              onStart={(mode) => {
                setSessionMode(mode);
                setGameState("playing");
              }}
              rules={[
                "Collect bioluminescent chains to stay oriented in the trench.",
                "Use the route beacon and headlamp cone to read the next safe direction.",
                "Predator and pirate glints mean change course before oxygen runs low.",
              ]}
              secondaryAccent="#a78bfa"
              startLabel="Start Descent"
              title="COLLECTOR"
            />
          </motion.div>
        )}
        {gameState === "playing" && (
          <motion.div
            key="playing"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <DeepSeaGame
              mode={sessionMode}
              onComplete={(s) => {
                setFinalScore(s);
                setGameState("complete");
              }}
              onGameOver={(s) => {
                setFinalScore(s);
                setGameState("gameover");
              }}
            />
          </motion.div>
        )}
        {gameState === "gameover" && (
          <motion.div key="gameover" className="absolute inset-0" exit={{ opacity: 0 }}>
            <GameOverScreen
              accent="#4ecdc4"
              result={{
                mode: sessionMode,
                score: finalScore,
                slug: "bioluminescent-sea",
                status: "failed",
                summary: `Dive logged at ${finalScore} score`,
              }}
              title="Dive Logged"
              subtitle={`Score ${finalScore}. The route remains recoverable: follow beacon chains before oxygen or predators close in.`}
              actions={
                <OverlayButton onClick={() => setGameState("landing")}>Dive Again</OverlayButton>
              }
            />
          </motion.div>
        )}
        {gameState === "complete" && (
          <motion.div key="complete" className="absolute inset-0" exit={{ opacity: 0 }}>
            <GameOverScreen
              accent="#4ecdc4"
              result={{
                milestones: ["living-map-complete"],
                mode: sessionMode,
                score: finalScore,
                slug: "bioluminescent-sea",
                status: "completed",
                summary: `Recovered ${finalSummary.totalBeacons} beacons`,
              }}
              title="Living Map Complete"
              subtitle={`All ${finalSummary.totalBeacons} beacons recovered. Score ${finalScore}. Replay for cleaner chains and deeper landmark mastery.`}
              actions={
                <OverlayButton onClick={() => setGameState("landing")}>
                  Chart Another Route
                </OverlayButton>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameViewport>
  );
}
