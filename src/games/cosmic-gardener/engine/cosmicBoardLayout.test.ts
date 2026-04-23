import { describe, expect, test } from "vitest";
import { getCosmicLowerBoardLayout } from "./cosmicBoardLayout";

describe("cosmic board layout", () => {
  test("moves gauges out of the lower table on very narrow portrait screens", () => {
    const layout = getCosmicLowerBoardLayout({
      height: 720,
      isMobile: true,
      isPortrait: true,
      width: 360,
    });

    expect(layout.compactPortrait).toBe(true);
    expect(layout.lowerHudVariant).toBe("upper-strip");
    expect(layout.flipperBottomPct).toBeGreaterThanOrEqual(8);
    expect(layout.launcherButtonSizePx).toBeGreaterThanOrEqual(44);
    expect(layout.tableBottomInsetPct).toBeGreaterThan(6);
  });

  test("keeps desktop tables in the full lower-gauge composition", () => {
    const layout = getCosmicLowerBoardLayout({
      height: 720,
      isMobile: false,
      isPortrait: false,
      width: 1280,
    });

    expect(layout.compactPortrait).toBe(false);
    expect(layout.lowerHudVariant).toBe("bottom-bars");
    expect(layout.flipperBottomPct).toBeGreaterThanOrEqual(10);
    expect(layout.flipperWidthPct).toBeLessThan(18);
    expect(layout.launcherTrackHeightPx).toBeGreaterThan(120);
  });
});
