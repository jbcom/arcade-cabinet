import {
  CONSTELLATIONS,
  type ConstellationPattern,
  getConstellationForLevel,
} from "./constellations";

export const DEFAULT_POINT_MATCH_RADIUS = 8;

export function findMatchedPointId(
  pattern: ConstellationPattern,
  x: number,
  y: number,
  radius = DEFAULT_POINT_MATCH_RADIUS
) {
  const matchedPoint = pattern.points.find((point) => {
    const dx = point.x - x;
    const dy = point.y - y;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  });

  return matchedPoint?.id ?? null;
}

export function getPatternConnectionKey(
  pattern: ConstellationPattern,
  starPointMatches: Map<string, string>,
  fromStarId: string,
  toStarId: string
) {
  const fromPointId = starPointMatches.get(fromStarId);
  const toPointId = starPointMatches.get(toStarId);
  if (!fromPointId || !toPointId) return null;

  const connection = pattern.connections.find(
    (conn) =>
      (conn.from === fromPointId && conn.to === toPointId) ||
      (conn.from === toPointId && conn.to === fromPointId)
  );

  return connection ? `${connection.from}-${connection.to}` : null;
}

export function isConstellationComplete(
  pattern: ConstellationPattern,
  completedPoints: Set<string>,
  completedConnections: Set<string>
) {
  const allPointsPlanted = pattern.points.every((point) => completedPoints.has(point.id));
  const allConnectionsMade = pattern.connections.every((conn) => {
    const key = `${conn.from}-${conn.to}`;
    const reverseKey = `${conn.to}-${conn.from}`;
    return completedConnections.has(key) || completedConnections.has(reverseKey);
  });

  return allPointsPlanted && allConnectionsMade;
}

export function getNextConstellationPreview(level: number) {
  if (level + 1 > CONSTELLATIONS.length) return null;

  const nextPattern = getConstellationForLevel(level + 1);

  return {
    connectionCount: nextPattern.connections.length,
    level: level + 1,
    name: nextPattern.name,
    pointCount: nextPattern.points.length,
  };
}

export function isGardenCompleteLevel(level: number): boolean {
  return level >= CONSTELLATIONS.length;
}

export interface CosmicZenTransitionCue {
  title: string;
  subtitle: string;
  completionLabel: string;
  replayPromise: string;
  intensity: number;
  bloomRings: number;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function getCosmicZenTransitionCue({
  constellationsCompleted,
  score,
  totalConstellations = CONSTELLATIONS.length,
}: {
  constellationsCompleted: number;
  score: number;
  totalConstellations?: number;
}): CosmicZenTransitionCue {
  const completionRatio =
    totalConstellations <= 0 ? 1 : Math.min(1, constellationsCompleted / totalConstellations);
  const intensity = Math.max(0.35, Math.round(completionRatio * 100) / 100);
  const bloomRings = Math.max(3, Math.min(7, Math.round(3 + completionRatio * 4)));

  return {
    bloomRings,
    completionLabel: `${constellationsCompleted}/${totalConstellations} constellations awake`,
    intensity,
    palette: {
      accent: "#fbbf24",
      primary: "#22d3ee",
      secondary: "#ec4899",
    },
    replayPromise:
      score >= 50_000
        ? "Cultivate freely, chase cleaner links, and keep the living table glowing."
        : "Cultivate freely, rebuild routes, and turn the living table into a score garden.",
    subtitle: "All constellation beds are awake. The table settles into free cultivation.",
    title: "Zen Garden Bloom",
  };
}
