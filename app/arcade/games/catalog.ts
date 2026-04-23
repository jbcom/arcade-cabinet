/**
 * Every game has been extracted to its own standalone repo under
 * the `arcade-cabinet/<slug>` org. The cabinet catalog is empty;
 * the cabinet itself is being dissolved.
 */

export interface Game {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  color: string;
  motif: string;
  secondaryAccent: string;
  gradient: string;
  pillars: string[];
  presentation: string;
  sceneDirection: string;
  responsiveDirection: string;
  coreMessage: string;
  coreLoop: string;
  sessionTarget: string;
  pressureType: string;
  defaultControls: string;
  winReplayPromise: string;
  difficultyVariants: unknown;
}

export const games: readonly Game[] = [];
export type GameSlug = string;

export const gamesBySlug: Record<string, Game> = {};

export function getGameBySlug(slug: string): Game | undefined {
  return gamesBySlug[slug];
}
