export interface CosmicBoardViewport {
  aspectRatio?: number;
  height: number;
  isMobile?: boolean;
  isPortrait?: boolean;
  width: number;
}

export interface CosmicLowerBoardLayout {
  apronHeightPct: number;
  compactPortrait: boolean;
  flipperBottomPct: number;
  flipperHeightPct: number;
  flipperWidthPct: number;
  launcherBottomPct: number;
  launcherButtonSizePx: number;
  launcherTrackHeightPx: number;
  lowerHudVariant: "bottom-bars" | "upper-strip";
  railInsetXPercent: number;
  tableBottomInsetPct: number;
  touchTargetPx: number;
}

export function getCosmicLowerBoardLayout(viewport: CosmicBoardViewport): CosmicLowerBoardLayout {
  const width = Math.max(0, viewport.width);
  const height = Math.max(0, viewport.height);
  const isPortrait = viewport.isPortrait ?? height > width;
  const aspectRatio = viewport.aspectRatio ?? (height > 0 ? width / height : 1);
  const isVeryNarrowPortrait = width > 0 && width <= 430 && isPortrait && aspectRatio < 0.72;
  const isMobilePortrait =
    !isVeryNarrowPortrait && (viewport.isMobile ?? width < 768) && isPortrait;

  if (isVeryNarrowPortrait) {
    return {
      apronHeightPct: 18,
      compactPortrait: true,
      flipperBottomPct: 8.5,
      flipperHeightPct: 3.2,
      flipperWidthPct: 17,
      launcherBottomPct: 19,
      launcherButtonSizePx: 46,
      launcherTrackHeightPx: 108,
      lowerHudVariant: "upper-strip",
      railInsetXPercent: 6,
      tableBottomInsetPct: 8.5,
      touchTargetPx: 46,
    };
  }

  if (isMobilePortrait) {
    return {
      apronHeightPct: 17,
      compactPortrait: true,
      flipperBottomPct: 8,
      flipperHeightPct: 3.4,
      flipperWidthPct: 18,
      launcherBottomPct: 18,
      launcherButtonSizePx: 44,
      launcherTrackHeightPx: 116,
      lowerHudVariant: "upper-strip",
      railInsetXPercent: 5.5,
      tableBottomInsetPct: 7.5,
      touchTargetPx: 44,
    };
  }

  return {
    apronHeightPct: 15,
    compactPortrait: false,
    flipperBottomPct: 10,
    flipperHeightPct: 3.4,
    flipperWidthPct: 16,
    launcherBottomPct: 17,
    launcherButtonSizePx: 36,
    launcherTrackHeightPx: 128,
    lowerHudVariant: "bottom-bars",
    railInsetXPercent: 5,
    tableBottomInsetPct: 6,
    touchTargetPx: 36,
  };
}
