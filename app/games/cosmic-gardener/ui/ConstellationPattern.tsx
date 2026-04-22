import type { ConstellationPattern as ConstellationPatternType } from "@logic/games/cosmic-gardener/engine/constellations";
import { cn } from "@logic/games/cosmic-gardener/lib/utils";
import { motion } from "framer-motion";

interface ConstellationPatternProps {
  pattern: ConstellationPatternType;
  completedPoints: Set<string>;
  completedConnections: Set<string>;
  className?: string;
}

export function ConstellationPattern({
  pattern,
  completedPoints,
  completedConnections,
  className,
}: ConstellationPatternProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <svg
        aria-hidden="true"
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {pattern.connections.map((conn, index) => {
          const fromPoint = pattern.points.find((p) => p.id === conn.from);
          const toPoint = pattern.points.find((p) => p.id === conn.to);
          if (!fromPoint || !toPoint) return null;

          const connectionKey = `${conn.from}-${conn.to}`;
          const reverseKey = `${conn.to}-${conn.from}`;
          const isCompleted =
            completedConnections.has(connectionKey) || completedConnections.has(reverseKey);

          return (
            <motion.line
              key={connectionKey}
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={toPoint.x}
              y2={toPoint.y}
              stroke={isCompleted ? "rgba(251, 191, 36, 0.8)" : "rgba(255, 255, 255, 0.15)"}
              strokeWidth={isCompleted ? 0.4 : 0.2}
              strokeDasharray={isCompleted ? "none" : "1 1"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                stroke: isCompleted ? "rgba(251, 191, 36, 0.8)" : "rgba(255, 255, 255, 0.15)",
              }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          );
        })}

        {pattern.points.map((point, index) => {
          const isCompleted = completedPoints.has(point.id);

          return (
            <g key={point.id}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={2.5}
                fill="none"
                stroke={isCompleted ? "rgba(251, 191, 36, 0.4)" : "rgba(255, 255, 255, 0.1)"}
                strokeWidth={0.2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: isCompleted ? 1 : 0.5,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.15,
                }}
              />

              <motion.circle
                cx={point.x}
                cy={point.y}
                r={1}
                fill={isCompleted ? "rgba(251, 191, 36, 0.9)" : "rgba(255, 255, 255, 0.3)"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              />

              {isCompleted &&
                [0, 45, 90, 135].map((angle) => (
                  <motion.line
                    key={`burst-${point.id}-${angle}`}
                    x1={point.x}
                    y1={point.y}
                    x2={point.x + Math.cos((angle * Math.PI) / 180) * 2}
                    y2={point.y + Math.sin((angle * Math.PI) / 180) * 2}
                    stroke="rgba(251, 191, 36, 0.6)"
                    strokeWidth={0.15}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: [0.6, 0.2, 0.6], pathLength: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ))}
            </g>
          );
        })}
      </svg>

      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-white/40 text-sm font-light tracking-widest uppercase">
          {pattern.name}
        </span>
      </motion.div>
    </div>
  );
}
