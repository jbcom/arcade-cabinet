import type {
  MovementInput,
  RealmLayout,
  RealmRelic,
  RealmState,
  RealmZonePalette,
  Vec3,
} from "./types";
import { CONFIG } from "./types";

const ZONES: RealmZonePalette[] = [
  {
    background: "#07111f",
    fog: "#0c1b2f",
    floor: "#13251f",
    path: "#256d68",
    accent: "#7dd3fc",
    secondary: "#c084fc",
  },
  {
    background: "#130d2a",
    fog: "#24114a",
    floor: "#1d1934",
    path: "#6d28d9",
    accent: "#c084fc",
    secondary: "#f0abfc",
  },
  {
    background: "#1e1535",
    fog: "#312044",
    floor: "#221b2d",
    path: "#a855f7",
    accent: "#fbbf24",
    secondary: "#fb7185",
  },
  {
    background: "#081f1d",
    fog: "#0d3b36",
    floor: "#122620",
    path: "#14b8a6",
    accent: "#5eead4",
    secondary: "#fde68a",
  },
];

const DEFAULT_MOVEMENT: MovementInput = { x: 0, z: 0 };

export function createInitialRealmState(phase: RealmState["phase"] = "menu"): RealmState {
  const player = { x: 0, y: 5, z: 0 };
  const layout = createRealmLayout(1);

  return {
    phase,
    hp: 100,
    maxHp: 100,
    atk: 10,
    zone: 1,
    score: 0,
    loot: [],
    attunement: 0,
    nearestRelicDistance: Math.round(findNearestRelicDistance(layout.relics, player, [])),
    portalDistance: Math.round(distance(player, tupleToVec3(layout.portal))),
    objective:
      "Follow the runic causeway, claim relics, and cross the portal before the realm shifts.",
    player,
    movement: { ...DEFAULT_MOVEMENT },
  };
}

export function createRealmLayout(zone = 1): RealmLayout {
  return {
    pillars: Array.from({ length: 12 }, (_, index) => ({
      id: `pillar-${zone}-${index + 1}`,
      angle: (index / 12) * Math.PI * 2 + zone * 0.04,
      radius: 24 + (index % 3) * 6,
      height: 7 + ((index + zone) % 4),
    })),
    runicRings: [8, 16, 26, 38],
    pathSlabs: Array.from({ length: 11 }, (_, index) => ({
      id: `path-slab-${index + 1}`,
      z: -30 + index * 6,
      width: index % 2 === 0 ? 5.6 : 4.6,
    })),
    floatingSigils: Array.from({ length: 8 }, (_, index) => ({
      id: `floating-sigil-${zone}-${index + 1}`,
      angle: (index / 8) * Math.PI * 2 + zone * 0.08,
      radius: 18 + (index % 2) * 10,
      y: 5 + (index % 3) * 1.4,
    })),
    relics: createRealmRelics(zone),
    sentinels: Array.from({ length: 5 }, (_, index) => {
      const angle = (index / 5) * Math.PI * 2 + 0.35;
      const radius = 18 + (index % 2) * 8;
      return {
        id: `sentinel-${zone}-${index + 1}`,
        position: [round(Math.sin(angle) * radius), 1.2, round(Math.cos(angle) * radius)] as [
          number,
          number,
          number,
        ],
        scale: index % 2 === 0 ? [1.4, 2.6, 1.4] : [1.1, 2.1, 1.1],
        patrolRadius: 3 + index,
      };
    }),
    portal: [0, 7, -42],
  };
}

export function getZonePalette(zone: number): RealmZonePalette {
  return ZONES[(Math.max(1, zone) - 1) % ZONES.length] ?? ZONES[0];
}

export function normalizeMovement(input: Partial<MovementInput> = {}): MovementInput {
  return {
    x: clamp(input.x ?? 0, -1, 1),
    z: clamp(input.z ?? 0, -1, 1),
  };
}

export function calculateMovementVelocity(input: MovementInput): Vec3 {
  const movement = normalizeMovement(input);
  const length = Math.hypot(movement.x, movement.z);
  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: (movement.x / length) * CONFIG.MOVE_SPEED,
    y: 0,
    z: (movement.z / length) * CONFIG.MOVE_SPEED,
  };
}

export function advanceRealmState(
  state: RealmState,
  telemetry: Partial<{ player: Vec3; movement: Partial<MovementInput> }> = {}
): RealmState {
  if (state.phase !== "playing") {
    return state;
  }

  const player = telemetry.player ?? state.player;
  const movement = normalizeMovement({ ...state.movement, ...telemetry.movement });
  const layout = createRealmLayout(state.zone);
  const relic = findNearbyRelic(layout.relics, player, state.loot);
  const nearestRelicDistance = findNearestRelicDistance(layout.relics, player, state.loot);
  const portalDistance = distance(player, tupleToVec3(layout.portal));
  const crossedPortal = portalDistance < CONFIG.PORTAL_RADIUS;
  const loot = relic ? [...state.loot, relic.name] : state.loot;
  const zone = crossedPortal ? state.zone + 1 : state.zone;
  const attunement = calculateRelicAttunement(loot.length, nearestRelicDistance, portalDistance);
  const score = Math.max(
    state.score,
    Math.floor(Math.hypot(player.x, player.z)) + loot.length * 50 + (zone - 1) * 120 + attunement
  );

  return {
    ...state,
    zone,
    atk: state.atk + (loot.length - state.loot.length) * 2,
    hp: relic ? Math.min(state.maxHp, state.hp + getRelicHeal(relic)) : state.hp,
    score,
    loot,
    attunement,
    nearestRelicDistance: Math.round(nearestRelicDistance),
    portalDistance: Math.round(portalDistance),
    objective: crossedPortal
      ? `Realm ${state.zone} crossed. Stabilize Zone ${zone} and seek the next relic.`
      : relic
        ? `${relic.name} bound. Push toward the portal while the realm is calm.`
        : "Follow the runic causeway, claim relics, and cross the portal before the realm shifts.",
    player: { ...player },
    movement,
  };
}

export function calculateRelicAttunement(
  lootCount: number,
  nearestRelicDistance: number,
  portalDistance: number
) {
  const lootSignal = lootCount * 18;
  const relicSignal = Math.max(0, 18 - nearestRelicDistance);
  const portalSignal = Math.max(0, 16 - portalDistance) * 0.75;

  return Math.round(Math.min(100, lootSignal + relicSignal + portalSignal));
}

function createRealmRelics(zone: number): RealmRelic[] {
  const names = ["Moonlit Lens", "Ashen Compass", "Violet Key"];

  return names.map((name, index) => {
    const angle = (index / names.length) * Math.PI * 2 + zone * 0.28;
    const radius = 11 + index * 7;
    return {
      id: `relic-${zone}-${index + 1}`,
      name: `${name} ${toRoman(zone)}`,
      position: [round(Math.sin(angle) * radius), 1.35, round(Math.cos(angle) * radius)] as [
        number,
        number,
        number,
      ],
      rarity: index === 2 ? "mythic" : index === 1 ? "rare" : "common",
    };
  });
}

function findNearbyRelic(relics: RealmRelic[], player: Vec3, loot: string[]) {
  return relics.find(
    (relic) =>
      !loot.includes(relic.name) &&
      distance(tupleToVec3(relic.position), player) < CONFIG.RELIC_RADIUS
  );
}

function findNearestRelicDistance(relics: RealmRelic[], player: Vec3, loot: string[]) {
  const distances = relics
    .filter((relic) => !loot.includes(relic.name))
    .map((relic) => distance(tupleToVec3(relic.position), player));

  return distances.length > 0 ? Math.min(...distances) : 0;
}

function getRelicHeal(relic: RealmRelic) {
  if (relic.rarity === "mythic") return 18;
  if (relic.rarity === "rare") return 12;
  return 8;
}

function tupleToVec3(tuple: [number, number, number]): Vec3 {
  return { x: tuple[0], y: tuple[1], z: tuple[2] };
}

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toRoman(value: number) {
  const symbols = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return symbols[(value - 1) % symbols.length] ?? "I";
}
