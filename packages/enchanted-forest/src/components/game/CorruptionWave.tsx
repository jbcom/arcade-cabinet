import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface CorruptionShadow {
  id: number;
  x: number;
  y: number;
  targetTreeIndex: number;
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
}

interface CorruptionWaveProps {
  shadows: CorruptionShadow[];
  onShadowReachTree: (shadowId: number, treeIndex: number) => void;
  treePositions: { x: number; y: number }[];
  isPurifying: boolean;
  purifyZone?: { x: number; y: number; radius: number } | null;
}

export function CorruptionWave({
  shadows,
  onShadowReachTree,
  treePositions,
  purifyZone,
}: CorruptionWaveProps) {
  return (
    <AnimatePresence>
      {shadows.map((shadow) => (
        <CorruptionShadowEntity
          key={shadow.id}
          shadow={shadow}
          treePosition={treePositions[shadow.targetTreeIndex]}
          onReachTree={() => onShadowReachTree(shadow.id, shadow.targetTreeIndex)}
          purifyZone={purifyZone}
        />
      ))}
    </AnimatePresence>
  );
}

interface CorruptionShadowEntityProps {
  shadow: CorruptionShadow;
  treePosition: { x: number; y: number };
  onReachTree: () => void;
  purifyZone?: { x: number; y: number; radius: number } | null;
}

function CorruptionShadowEntity({
  shadow,
  treePosition,
  onReachTree,
  purifyZone,
}: CorruptionShadowEntityProps) {
  const [position, setPosition] = useState({ x: shadow.x, y: shadow.y });
  const [isVaporizing, setIsVaporizing] = useState(false);

  useEffect(() => {
    if (purifyZone) {
      const dx = position.x - purifyZone.x;
      const dy = position.y - purifyZone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < purifyZone.radius) {
        setIsVaporizing(true);
      }
    }
  }, [purifyZone, position]);

  useEffect(() => {
    if (isVaporizing) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
        const dx = treePosition.x - prev.x;
        const dy = treePosition.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 3) {
          onReachTree();
          return prev;
        }
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        return {
          x: prev.x + normalizedDx * shadow.speed * 0.3,
          y: prev.y + normalizedDy * shadow.speed * 0.3,
        };
      });
    }, 16);
    return () => clearInterval(interval);
  }, [treePosition, shadow.speed, onReachTree, isVaporizing]);

  if (isVaporizing) {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: [1, 1.5, 0],
          opacity: [1, 0.5, 0],
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="absolute inset-0 -m-10 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%)",
          }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -top-8 text-amber-400 text-xl font-black whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: -20 }}
          transition={{ duration: 0.5 }}
          style={{ textShadow: "0 0 10px rgba(251, 191, 36, 0.8)" }}
        >
          浄化!
        </motion.div>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos((i * Math.PI * 2) / 12) * 50,
              y: Math.sin((i * Math.PI * 2) / 12) * 50,
              opacity: 0,
              scale: [1, 0],
            }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
            style={{
              boxShadow: "0 0 8px rgba(251, 191, 36, 0.8)",
            }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: shadow.size * 3,
          height: shadow.size * 3,
          left: -shadow.size * 1.5,
          top: -shadow.size * 1.5,
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(75, 0, 130, 0.4) 0%, rgba(50, 0, 80, 0.2) 50%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </motion.div>
      <motion.div
        className="relative"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 0.8 + Math.random() * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="rounded-full relative overflow-hidden"
          style={{
            width: shadow.size,
            height: shadow.size,
            background:
              "radial-gradient(ellipse at 30% 30%, rgba(120, 50, 150, 0.9) 0%, rgba(60, 20, 80, 0.95) 50%, rgba(30, 5, 50, 1) 100%)",
            boxShadow: `
              0 0 ${shadow.size / 2}px rgba(100, 40, 120, 0.6),
              inset 0 -${shadow.size / 4}px ${shadow.size / 3}px rgba(0, 0, 0, 0.5),
              inset 0 ${shadow.size / 6}px ${shadow.size / 4}px rgba(150, 80, 180, 0.3)
            `,
          }}
        >
          <div
            className="absolute w-2 h-2 rounded-full bg-purple-300/50"
            style={{
              top: shadow.size * 0.15,
              left: shadow.size * 0.25,
            }}
          />
        </div>
        <div
          className="absolute flex gap-1"
          style={{
            left: shadow.size * 0.18,
            top: shadow.size * 0.22,
          }}
        >
          <motion.div
            className="relative"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <div
              className="w-2 h-2.5 bg-red-500 rounded-full"
              style={{
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.9)",
              }}
            />
            <div className="absolute w-1 h-1 bg-white rounded-full top-0.5 left-0.5 opacity-60" />
          </motion.div>
          <motion.div
            className="relative"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.1 }}
          >
            <div
              className="w-2 h-2.5 bg-red-500 rounded-full"
              style={{
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.9)",
              }}
            />
            <div className="absolute w-1 h-1 bg-white rounded-full top-0.5 left-0.5 opacity-60" />
          </motion.div>
        </div>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-800"
            style={{
              left: shadow.size * 0.3 + i * 8,
              bottom: -5,
            }}
            animate={{
              y: [-5, -15, -5],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 1 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-t from-purple-900/80 to-transparent rounded-full"
            style={{
              width: 4,
              height: shadow.size * 0.5,
              left: shadow.size * 0.3 + i * (shadow.size * 0.2),
              top: shadow.size * -0.3,
              transformOrigin: "bottom center",
            }}
            animate={{
              rotate: [-10 + i * 10, 10 + i * 10, -10 + i * 10],
              scaleY: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.2 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      <motion.div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-purple-300/70 font-bold whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        闇の影
      </motion.div>
    </motion.div>
  );
}
