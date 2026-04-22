import { GameViewport } from "@arcade-cabinet/shared";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameLoop } from "./hooks/useGameLoop";
import { useTouchInput } from "./hooks/useTouchInput";
import { fbm, noise2D } from "./lib/perlin";
import { NauticalLanding } from "./ui/game/NauticalLanding";

type CreatureType = "jellyfish" | "plankton" | "fish";

interface Creature {
  id: string;
  type: CreatureType;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  glowIntensity: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
  pulsePhase: number;
}

interface Predator {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  noiseOffset: number;
}

interface Pirate {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  noiseOffset: number;
  lanternPhase: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  drift: number;
}

interface Player {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
  glowIntensity: number;
}

const GAME_DURATION = 60;
const CREATURE_TYPES: CreatureType[] = ["jellyfish", "plankton", "fish"];
const CREATURE_COLORS: Record<CreatureType, { color: string; glow: string }> = {
  jellyfish: { color: "#7dd3fc", glow: "#0ea5e9" },
  plankton: { color: "#a5f3fc", glow: "#22d3ee" },
  fish: { color: "#c4b5fd", glow: "#8b5cf6" },
};
const CREATURE_POINTS: Record<CreatureType, number> = {
  jellyfish: 30,
  plankton: 10,
  fish: 50,
};

interface SceneState {
  creatures: Creature[];
  particles: Particle[];
  pirates: Pirate[];
  player: Player;
  predators: Predator[];
}

function drawCreature(ctx: CanvasRenderingContext2D, c: Creature) {
  ctx.save();
  ctx.translate(c.x, c.y);
  const glowSize = c.size * 1.5 * c.glowIntensity;
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
  glow.addColorStop(0, `${c.glowColor}60`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.arc(0, 0, c.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPredator(ctx: CanvasRenderingContext2D, p: Predator) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(p.size * 0.2, -p.size * 0.1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPirate(ctx: CanvasRenderingContext2D, p: Pirate) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(-20, -10, 40, 20);
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.fillStyle = "#4ecdc4";
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneState
) {
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0c1929");
  gradient.addColorStop(1, "#030810");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  scene.particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 220, 255, ${particle.opacity})`;
    ctx.fill();
  });

  scene.creatures.forEach((creature) => {
    drawCreature(ctx, creature);
  });
  scene.predators.forEach((predator) => {
    drawPredator(ctx, predator);
  });
  scene.pirates.forEach((pirate) => {
    drawPirate(ctx, pirate);
  });
  drawPlayer(ctx, scene.player);
}

function DeepSeaGame({ onGameOver }: { onGameOver: (score: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [multiplier, setMultiplier] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isGameOver, setIsGameOver] = useState(false);

  const playerRef = useRef<Player>({
    x: 400,
    y: 300,
    targetX: 400,
    targetY: 300,
    angle: 0,
    glowIntensity: 1,
  });
  const creaturesRef = useRef<Creature[]>([]);
  const predatorsRef = useRef<Predator[]>([]);
  const piratesRef = useRef<Pirate[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastCollectTimeRef = useRef(0);
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
    const { width, height } = dimensions;
    const center = { x: width / 2, y: height / 2 };
    const spawnAwayFromCenter = (minDistance: number) => {
      for (let attempt = 0; attempt < 30; attempt++) {
        const position = { x: Math.random() * width, y: Math.random() * height };
        const dx = position.x - center.x;
        const dy = position.y - center.y;
        if (Math.sqrt(dx * dx + dy * dy) >= minDistance) {
          return position;
        }
      }

      return { x: width * 0.12, y: height * 0.12 };
    };

    playerRef.current = {
      x: center.x,
      y: center.y,
      targetX: center.x,
      targetY: center.y,
      angle: 0,
      glowIntensity: 1,
    };

    creaturesRef.current = Array.from({ length: 15 }, (_, i) => {
      const type = CREATURE_TYPES[Math.floor(Math.random() * CREATURE_TYPES.length)];
      return {
        id: `creature-${i}`,
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 20 + Math.random() * 30,
        color: CREATURE_COLORS[type].color,
        glowColor: CREATURE_COLORS[type].glow,
        glowIntensity: 0.5 + Math.random() * 0.5,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.3 + Math.random() * 0.4,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    predatorsRef.current = Array.from({ length: 2 }, (_, i) => {
      const position = spawnAwayFromCenter(Math.min(width, height) * 0.35);
      return {
        id: `predator-${i}`,
        x: position.x,
        y: position.y,
        size: 60 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.3,
        noiseOffset: Math.random() * 1000,
      };
    });

    piratesRef.current = Array.from({ length: 2 }, (_, i) => ({
      id: `pirate-${i}`,
      x: i === 0 ? -50 : width + 50,
      y: height * 0.3 + Math.random() * height * 0.4,
      angle: i === 0 ? 0 : Math.PI,
      speed: 0.8 + Math.random() * 0.4,
      noiseOffset: Math.random() * 1000,
      lanternPhase: Math.random() * Math.PI * 2,
    }));

    particlesRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.3,
      speed: 0.2 + Math.random() * 0.5,
      drift: Math.random() * Math.PI * 2,
    }));
  }, [dimensions]);

  const gameLoop = useCallback(
    (deltaTime: number, totalTime: number) => {
      if (isGameOver) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const { width, height } = dimensions;

      const newTimeLeft = Math.max(0, GAME_DURATION - Math.floor(totalTime));
      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
        if (newTimeLeft === 0) {
          setIsGameOver(true);
          onGameOver(scoreRef.current);
          return;
        }
      }

      const player = playerRef.current;
      if (input.isActive) {
        player.targetX = input.x;
        player.targetY = input.y;
      }

      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        const speed = Math.min(distance * 0.08, 8);
        player.x += (dx / distance) * speed;
        player.y += (dy / distance) * speed;
        player.angle = Math.atan2(dy, dx);
      }

      player.glowIntensity = 0.7 + Math.sin(totalTime * 3) * 0.3;

      creaturesRef.current.forEach((creature) => {
        const noiseX = noise2D(
          creature.noiseOffsetX + totalTime * creature.speed,
          creature.noiseOffsetY
        );
        const noiseY = noise2D(
          creature.noiseOffsetX,
          creature.noiseOffsetY + totalTime * creature.speed
        );
        creature.x += noiseX * 2;
        creature.y += noiseY * 2;
        if (creature.x < -creature.size) creature.x = width + creature.size;
        if (creature.x > width + creature.size) creature.x = -creature.size;
        if (creature.y < -creature.size) creature.y = height + creature.size;
        if (creature.y > height + creature.size) creature.y = -creature.size;
        creature.pulsePhase += deltaTime * 2;
        creature.glowIntensity = 0.5 + Math.sin(creature.pulsePhase) * 0.3;
      });

      predatorsRef.current.forEach((predator) => {
        const pdx = player.x - predator.x;
        const pdy = player.y - predator.y;
        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
        const noiseAngle = fbm(predator.noiseOffset + totalTime * 0.3, totalTime * 0.2);

        if (pDist > 150) {
          predator.x += (pdx / pDist) * predator.speed + Math.cos(noiseAngle * Math.PI * 2) * 0.5;
          predator.y += (pdy / pDist) * predator.speed + Math.sin(noiseAngle * Math.PI * 2) * 0.5;
        } else {
          predator.x += (pdx / pDist) * predator.speed * 1.5;
          predator.y += (pdy / pDist) * predator.speed * 1.5;
        }
        predator.x = Math.max(0, Math.min(width, predator.x));
        predator.y = Math.max(0, Math.min(height, predator.y));
      });

      piratesRef.current.forEach((pirate) => {
        const pdx = player.x - pirate.x;
        const pdy = player.y - pirate.y;
        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
        pirate.lanternPhase += deltaTime * 5;
        const noiseY = noise2D(pirate.noiseOffset, totalTime * 0.5) * 2;

        if (pDist < 300) {
          const targetAngle = Math.atan2(pdy, pdx);
          pirate.angle += (targetAngle - pirate.angle) * 0.05;
          pirate.x += Math.cos(pirate.angle) * pirate.speed * 1.2;
          pirate.y += Math.sin(pirate.angle) * pirate.speed * 1.2 + noiseY * 0.5;
        } else {
          pirate.x += Math.cos(pirate.angle) * pirate.speed * 0.5;
          pirate.y += noiseY;
        }

        if (pirate.x < -100) {
          pirate.x = -100;
          pirate.angle = 0;
        }
        if (pirate.x > width + 100) {
          pirate.x = width + 100;
          pirate.angle = Math.PI;
        }
        pirate.y = Math.max(50, Math.min(height - 50, pirate.y));
      });

      particlesRef.current.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(particle.drift + totalTime) * 0.3;
        particle.opacity = 0.1 + Math.sin(totalTime * 2 + particle.drift) * 0.1;
        if (particle.y < 0) {
          particle.y = height;
          particle.x = Math.random() * width;
        }
      });

      creaturesRef.current = creaturesRef.current.filter((creature) => {
        const cdx = creature.x - player.x;
        const cdy = creature.y - player.y;
        const collisionDist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (collisionDist < creature.size + 30) {
          const timeSinceLast = totalTime - lastCollectTimeRef.current;
          const newMultiplier = timeSinceLast < 2 ? Math.min(multiplier + 1, 5) : 1;
          setMultiplier(newMultiplier);
          lastCollectTimeRef.current = totalTime;
          const points = CREATURE_POINTS[creature.type] * newMultiplier;
          scoreRef.current += points;
          setScore(scoreRef.current);
          return false;
        }
        return true;
      });

      for (const predator of predatorsRef.current) {
        const pdx = predator.x - player.x;
        const pdy = predator.y - player.y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < predator.size * 0.4 + 25) {
          setIsGameOver(true);
          onGameOver(scoreRef.current);
          return;
        }
      }

      renderScene(ctx, width, height, {
        creatures: creaturesRef.current,
        particles: particlesRef.current,
        pirates: piratesRef.current,
        player: playerRef.current,
        predators: predatorsRef.current,
      });
    },
    [dimensions, input, timeLeft, multiplier, isGameOver, onGameOver]
  );

  useGameLoop(gameLoop, !isGameOver);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10">
          <div className="text-cyan-400 text-xs uppercase font-bold tracking-widest mb-1">
            Score
          </div>
          <div className="text-white text-2xl font-bold">{score}</div>
        </div>
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10">
          <div className="text-cyan-400 text-xs uppercase font-bold tracking-widest mb-1">Time</div>
          <div className="text-white text-2xl font-bold">{timeLeft}s</div>
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const [gameState, setGameState] = useState<"landing" | "playing" | "gameover">("landing");
  const [finalScore, setFinalScore] = useState(0);

  return (
    <GameViewport background="#050d15">
      <AnimatePresence mode="wait">
        {gameState === "landing" && (
          <motion.div key="landing" className="absolute inset-0" exit={{ opacity: 0 }}>
            <NauticalLanding onStartGame={() => setGameState("playing")} />
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
              onGameOver={(s) => {
                setFinalScore(s);
                setGameState("gameover");
              }}
            />
          </motion.div>
        )}
        {gameState === "gameover" && (
          <motion.div
            key="gameover"
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
          >
            <h2 className="text-6xl font-bold text-white mb-8">Score: {finalScore}</h2>
            <button
              type="button"
              onClick={() => setGameState("landing")}
              className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-full"
            >
              Restart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GameViewport>
  );
}
