import { DEFAULT_DIFFICULTY_VARIANTS } from "@logic/shared";

export const games = [
  {
    slug: "mega-track",
    title: "MEGA TRACK",
    description: "Thread a high-speed machine through a deterministic hazard ribbon.",
    tags: ["r3f", "racing", "action"],
    color: "#fb7185",
    motif: "track",
    secondaryAccent: "#facc15",
    gradient: "linear-gradient(135deg, #fb7185, #7c2d12)",
    pillars: ["Instant lane reads", "Toy-scale speed", "Impact clarity"],
    presentation:
      "The track should feel like an exaggerated tabletop racer with a dark asphalt ribbon, bright rails, readable hazard choreography, and a camera that sells speed without hiding upcoming decisions.",
    sceneDirection:
      "Cyan and yellow rails, checkpoint gates, composite player and pace cars, cone/barrier silhouettes, and forward fog make distance readable while keeping the car central.",
    responsiveDirection:
      "Controls reduce to left/right lane choice with keyboard and page-mode touch buttons, so the same deterministic run works in a narrow Android shell or wide cabinet viewport.",
    coreMessage: "Speed feels fair when every hazard reads early.",
    coreLoop:
      "Run a three-leg cup, dodge silhouettes, chain clean passes, trigger overdrive, repair at checkpoints.",
    sessionTarget: "8-15 minute road cup",
    pressureType: "Predictable hazard density with checkpoint repair; challenge increases traffic",
    defaultControls: "Left/right touch lanes, keyboard arrows, or touch-anywhere steering",
    winReplayPromise: "Finish cleaner cups by turning near-misses into overdrive chains.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "overcast-glacier",
    title: "OVERCAST: GLACIER",
    description: "Ski a corrupted glacier as a kung-fu kitten fighting snowmen and glitches.",
    tags: ["react", "lane-runner", "action"],
    color: "#7dd3fc",
    motif: "track",
    secondaryAccent: "#10b981",
    gradient: "linear-gradient(135deg, #7dd3fc, #0f172a 48%, #10b981)",
    pillars: ["Downhill clarity", "Kung-fu interruption", "Warmth survival"],
    presentation:
      "The player should immediately read Kicks, three downhill lanes, cocoa warmth pickups, snowman threats, and glitch photo targets without needing the original larger Overcast scope.",
    sceneDirection:
      "Midnight arctic blue, scanline snow, matrix green glitches, cocoa warmth, and bright white snowmen give the reduced loop a strong label identity while staying mobile-readable.",
    responsiveDirection:
      "The lane surface and HUD use parent-relative geometry, and touch-anywhere joystick steering shares the same deterministic controls as keyboard play.",
    coreMessage: "Warmth and momentum keep a weird downhill day under control.",
    coreLoop:
      "Steer lanes, collect cocoa, kick snowmen, photograph glitches, clear glacier segments.",
    sessionTarget: "8-15 minute glacier route",
    pressureType:
      "Gentle warmth drain in standard, blizzard and cursed segment pressure in challenge",
    defaultControls: "Touch-anywhere joystick for lanes plus large kick/photo buttons",
    winReplayPromise:
      "Push farther through glacier segments with cleaner warmth and combo control.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "titan-mech",
    title: "TITAN MECH: OVERHEAT",
    description: "Pilot a heat-stressed extraction titan through ore pylons and reactor pressure.",
    tags: ["r3f", "cockpit", "action"],
    color: "#f43f5e",
    motif: "mech",
    secondaryAccent: "#f59e0b",
    gradient: "linear-gradient(135deg, #f43f5e, #4c0519)",
    pillars: ["Heavy chassis control", "Heat economy", "Industrial extraction"],
    presentation:
      "Titan Mech should feel like piloting mass through a hostile extraction yard: ore pylons, heat pressure, weapons, coolant, and hopper ejection all compete for attention.",
    sceneDirection:
      "Dark metal ground, orange ore rigs, cyan telemetry lights, ring markings, and hard directional shadows sell scale without cluttering the combat field.",
    responsiveDirection:
      "The camera follows the mech, and the arena layout is deterministic so desktop, mobile web, and Android builds render the same authored space.",
    coreMessage: "Heavy power is fun when heat discipline stays readable.",
    coreLoop: "Survey pylons, grind ore, eject hopper, cool the reactor, cash contracts, repeat.",
    sessionTarget: "8-15 minute extraction contract",
    pressureType:
      "Readable heat and contract pressure, with combat pressure reserved for challenge",
    defaultControls: "Touch-anywhere joystick plus extractor, coolant, and fire actions",
    winReplayPromise: "Complete richer contracts through cleaner heat, ore, and hopper routing.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "beppo-laughs",
    title: "BEPPO LAUGHS",
    description: "Keep composure inside a nightmare circus maze and find the exit.",
    tags: ["react", "maze", "horror-lite"],
    color: "#f97316",
    motif: "circus",
    secondaryAccent: "#22d3ee",
    gradient: "linear-gradient(135deg, #f97316, #450a0a 52%, #22d3ee)",
    pillars: ["Composure over panic", "Junction choices", "Item-gated escape"],
    presentation:
      "The maze should feel like a circus label come alive: striped tent geometry, readable junction cards, fear/despair meters, and clear item gates.",
    sceneDirection:
      "Warm sodium tent lights, cyan exit hints, red fear ticks, and striped paths give the horror tone without hiding available choices.",
    responsiveDirection:
      "Junction controls remain large card buttons on mobile, preserving the same deterministic maze graph on desktop and Android.",
    coreMessage: "Composure is a resource you spend to make one more good choice.",
    coreLoop:
      "Choose junctions, reveal rooms, gather blockade items, manage fear and despair, unlock the exit.",
    sessionTarget: "8-15 minute maze escape",
    pressureType: "Recoverable fear/despair pressure; challenge enables harsher sanity decay",
    defaultControls: "Large junction buttons with keyboard direction parity",
    winReplayPromise: "Escape with higher composure by learning safer routes and item order.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "cognitive-dissonance",
    title: "COGNITIVE DISSONANCE",
    description: "Stabilize a diegetic AI cabinet as patterns escape the glass mind.",
    tags: ["three", "diegetic", "pattern"],
    color: "#a78bfa",
    motif: "mind",
    secondaryAccent: "#67e8f9",
    gradient: "linear-gradient(135deg, #a78bfa, #111827 48%, #67e8f9)",
    pillars: ["Diegetic controls", "Coherence maintenance", "Readable pattern matching"],
    presentation:
      "The player is operating a haunted cabinet: a glass sphere, rim controls, rain/tendril pressure, and coherence feedback all live in the scene.",
    sceneDirection:
      "Violet glass, cyan rim lights, gold match pulses, and red coherence warnings should make the abstract AI state immediately readable.",
    responsiveDirection:
      "The raw Three canvas fits the parent shell, while rim buttons stay thumb-sized for portrait mobile and Android WebView play.",
    coreMessage: "Coherence returns when you answer the system in its own language.",
    coreLoop:
      "Match escaping patterns with rim controls, lower tension, recover coherence, survive a shift.",
    sessionTarget: "8-15 minute stabilization shift",
    pressureType:
      "Reversible coherence loss in standard; challenge overlaps more rain and tendrils",
    defaultControls: "Three large rim buttons with keyboard color parity",
    winReplayPromise: "Hold longer shifts by anticipating pattern color and tension waves.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "farm-follies",
    title: "FARM FOLLIES",
    description: "Drop, stack, merge, and bank a chaotic tower of farm animals.",
    tags: ["react", "stacker", "physics-lite"],
    color: "#84cc16",
    motif: "farm",
    secondaryAccent: "#f59e0b",
    gradient: "linear-gradient(135deg, #84cc16, #78350f 52%, #f59e0b)",
    pillars: ["One-verb stacking", "Farm identity", "Recoverable chaos"],
    presentation:
      "The stacker should look like a physical farm toy: chunky animal tiers, barn framing, wobble feedback, and banking as a clear safety valve.",
    sceneDirection:
      "Grass greens, warm hay, red barn accents, and readable animal blocks keep the tower playful instead of abstract.",
    responsiveDirection:
      "Drop lanes, bank, and ability controls are thumb-first and maintain the same deterministic stack on desktop, mobile, and Android.",
    coreMessage: "Chaos is fun when you can decide when to bank it.",
    coreLoop:
      "Drop animals, build and merge tiers, use abilities, bank score before the tower collapses.",
    sessionTarget: "8-15 minute stack-and-bank run",
    pressureType: "Wobble and recovery lives in standard; challenge keeps sharper Jenga failure",
    defaultControls: "Tap drop lanes and bank, with keyboard lane parity",
    winReplayPromise: "Chase higher animal tiers and smarter banking streaks.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
] as const;

export type Game = (typeof games)[number];
export type GameSlug = Game["slug"];

export const gamesBySlug = Object.fromEntries(games.map((game) => [game.slug, game])) as Record<
  GameSlug,
  Game
>;

export function getGameBySlug(slug: string): Game | undefined {
  return gamesBySlug[slug as GameSlug];
}
