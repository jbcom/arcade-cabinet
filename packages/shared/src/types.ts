export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover' | 'win';

export interface GameScore {
  value: number;
  label: string;
}
