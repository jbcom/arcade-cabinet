export interface Vec2 {
  x: number;
  y: number;
}

export interface GoatState {
  id: string;
  position: Vec2;
  speed: number;
  stunnedMs: number;
}

export interface OtterlyState {
  otter: Vec2;
  otterVelocity: Vec2;
  ball: Vec2;
  ballVelocity: Vec2;
  ballHealth: number;
  goats: GoatState[];
  goalRadius: number;
  elapsedMs: number;
  barkCooldownMs: number;
  objective: string;
}
