import type { ConstellationPattern } from "./constellations";

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
