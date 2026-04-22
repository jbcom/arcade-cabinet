import { describe, expect, test } from "vitest";
import {
  findMatchedPointId,
  getNextConstellationPreview,
  getPatternConnectionKey,
  isConstellationComplete,
} from "./constellationProgress";
import { CONSTELLATIONS } from "./constellations";

const lyra = CONSTELLATIONS[0];

describe("constellation progress", () => {
  test("matches planted stars to nearby pattern points", () => {
    expect(findMatchedPointId(lyra, 50, 30)).toBe("l1");
    expect(findMatchedPointId(lyra, 53, 33)).toBe("l1");
    expect(findMatchedPointId(lyra, 10, 90)).toBeNull();
  });

  test("maps star ids back to bidirectional pattern connections", () => {
    const matches = new Map([
      ["star-a", "l1"],
      ["star-b", "l2"],
      ["star-c", "l5"],
    ]);

    expect(getPatternConnectionKey(lyra, matches, "star-a", "star-b")).toBe("l1-l2");
    expect(getPatternConnectionKey(lyra, matches, "star-b", "star-a")).toBe("l1-l2");
    expect(getPatternConnectionKey(lyra, matches, "star-a", "star-c")).toBeNull();
  });

  test("requires every pattern point and every connection to complete a constellation", () => {
    const points = new Set(lyra.points.map((point) => point.id));
    const partialConnections = new Set(["l1-l2", "l1-l3", "l2-l4", "l3-l5"]);
    const completeConnections = new Set(lyra.connections.map((conn) => `${conn.from}-${conn.to}`));

    expect(isConstellationComplete(lyra, points, partialConnections)).toBe(false);
    expect(isConstellationComplete(lyra, points, completeConnections)).toBe(true);
  });

  test("previews the next constellation reward target", () => {
    const preview = getNextConstellationPreview(1);

    expect(preview).not.toBeNull();
    if (!preview) return;

    expect(preview.level).toBe(2);
    expect(preview.name).toBe(CONSTELLATIONS[1].name);
    expect(preview.pointCount).toBe(CONSTELLATIONS[1].points.length);
    expect(preview.connectionCount).toBe(CONSTELLATIONS[1].connections.length);
  });

  test("returns no preview after the final constellation", () => {
    expect(getNextConstellationPreview(CONSTELLATIONS.length)).toBeNull();
  });
});
