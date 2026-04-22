import { DEFAULT_DIFFICULTY_VARIANTS } from "@logic/shared";

export const games = [
  {
    slug: "bioluminescent-sea",
    title: "BIOLUMINESCENT SEA",
    description: "Descend into the deep ocean as a glowing collector of light.",
    tags: ["canvas", "framer-motion", "exploration"],
    color: "#4ecdc4",
    motif: "sea",
    secondaryAccent: "#a78bfa",
    gradient: "linear-gradient(135deg, #4ecdc4, #051018)",
    pillars: ["Quiet navigation", "Light as currency", "Threats read as silhouettes"],
    presentation:
      "The player should feel small inside a layered ocean volume: bright collectible life sits close to the camera while predators read as darker, slower shapes at the edge of vision.",
    sceneDirection:
      "Use deep vertical gradients, sparse particulate motion, and soft cyan/magenta glow to create depth without losing touch clarity on phones.",
    responsiveDirection:
      "Canvas simulation sizes from its parent island, not the browser window, so it can run fullscreen, embedded in the cabinet, or inside an Android WebView.",
    coreMessage: "Light turns an unknowable trench into a route you can trust.",
    coreLoop:
      "Follow beacon chains, collect glow, read predator silhouettes, reach trench landmarks, then replay for cleaner routes.",
    sessionTarget: "8-15 minute route mastery run",
    pressureType: "Slow oxygen and predator pressure with visible recovery pickups",
    defaultControls: "Touch-anywhere joystick or pointer drag toward the intended swim heading",
    winReplayPromise: "Reach deeper landmarks with a stronger route chain and higher glow score.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "cosmic-gardener",
    title: "COSMIC GARDENER",
    description: "Plant stars and build constellations in a hybrid pinball puzzle.",
    tags: ["react", "framer-motion", "puzzle"],
    color: "#fbbf24",
    motif: "cosmic",
    secondaryAccent: "#ec4899",
    gradient: "linear-gradient(135deg, #fbbf24, #ec4899)",
    pillars: ["Pinball energy", "Readable constellation routing", "Wonder without visual clutter"],
    presentation:
      "The board is a cosmic tabletop: the player reads flippers and launch power first, then star growth, then constellation goals.",
    sceneDirection:
      "Use warm star golds against a cool nebula field, with animated energy streams that clarify cause and effect instead of becoming decoration.",
    responsiveDirection:
      "All board coordinates stay percentage-based so the table composes vertically on mobile and wider as a cabinet island on desktop.",
    coreMessage: "A garden grows when motion is guided into constellations.",
    coreLoop:
      "Launch, flip, plant stars, connect the active pattern, claim a resonance bloom, preview the next constellation.",
    sessionTarget: "8-15 minute constellation set",
    pressureType: "Ball-save and void-zone pressure, generous in standard and colder in challenge",
    defaultControls: "Large flipper and launch buttons with keyboard parity",
    winReplayPromise: "Complete more star patterns and chase higher bloom chains.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "enchanted-forest",
    title: "ENCHANTED FOREST",
    description: "Protect sacred trees using musical runes and spirit magic.",
    tags: ["react", "tone.js", "manga"],
    color: "#10b981",
    motif: "forest",
    secondaryAccent: "#fbbf24",
    gradient: "linear-gradient(135deg, #10b981, #7c3aed)",
    pillars: ["Gesture spellcasting", "Sacred grove protection", "Music reinforces intent"],
    presentation:
      "The grove should feel theatrical and hand-authored: trees form a readable stage line, corruption travels as visible waves, and rune drawing owns the foreground.",
    sceneDirection:
      "Emerald, violet, and warm firefly accents separate safe life, magic, and corruption while keeping touch trails high contrast.",
    responsiveDirection:
      "Tree positions and drawing coordinates remain percentage-based, preserving the same tactical composition on portrait phones and desktop cabinets.",
    coreMessage: "Deliberate spell grammar keeps a threatened grove in harmony.",
    coreLoop:
      "Read the shadow path, draw shield/heal/purify runes, alternate spell types, build harmony, seal the wave.",
    sessionTarget: "8-15 minute grove defense set",
    pressureType: "Cadence-based wave pressure with legible corruption paths",
    defaultControls: "Pointer or touch rune drawing across the grove stage",
    winReplayPromise: "Survive longer wave sets by maintaining cleaner spell cadence.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "entropy-edge",
    title: "ENTROPY EDGE",
    description: "Hold a collapsing resonance field together at the edge of failure.",
    tags: ["r3f", "simulation", "systems"],
    color: "#38bdf8",
    motif: "entropy",
    secondaryAccent: "#ff0055",
    gradient: "linear-gradient(135deg, #38bdf8, #312e81)",
    pillars: [
      "Spatial logic under pressure",
      "Collapsing-system tension",
      "Readable anchor objectives",
    ],
    presentation:
      "The grid is a failing machine room in abstract space: the player sphere, falling blocks, and anchors each need distinct silhouette and glow priority.",
    sceneDirection:
      "Camera orbit, low fog, cyan player light, and magenta anchors should create a readable tactical diorama rather than a flat board.",
    responsiveDirection:
      "The camera distance and orbit controls frame the full grid in a parent-sized canvas, allowing cabinet, desktop, and Android WebView containers to share the same scene.",
    coreMessage: "Stability is earned by choosing when to secure and when to surge.",
    coreLoop:
      "Move through sectors, secure anchors, build resonance, spend surges to clear routes, carry reserves forward.",
    sessionTarget: "8-15 minute multi-sector stabilization run",
    pressureType:
      "Stability reserve pressure instead of short forced timers; challenge restores tighter decay",
    defaultControls: "Touch-anywhere joystick with keyboard movement parity",
    winReplayPromise: "Chain anchors and resonance clears across deeper sectors.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
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
    slug: "otterly-chaotic",
    title: "OTTERLY CHAOTIC",
    description: "Navigate a chaotic otter through a series of wild challenges.",
    tags: ["r3f", "physics", "action"],
    color: "#0ea5e9",
    motif: "otter",
    secondaryAccent: "#84cc16",
    gradient: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
    pillars: ["Protect the salad", "Readable chase triangle", "Comedic physicality"],
    presentation:
      "The scene is a small chase arena where otter, goats, salad, water, and goal are always visible enough to plan a rescue route.",
    sceneDirection:
      "Bright pasture, blue water, warm crater marker, fence rails, reeds, composite salad leaves, and soft animal materials keep the tone playful while preserving collision readability.",
    responsiveDirection:
      "The fixed arena camera widens for portrait, and page-mode touch controls keep mobile and Android play equivalent to keyboard input.",
    coreMessage: "A rescue is readable when the chase triangle is honest.",
    coreLoop:
      "Read goat intent, place the otter, bark to rally, protect salad pieces, push them to safety.",
    sessionTarget: "8-15 minute rescue arena set",
    pressureType: "Telegraphed goat pressure with bark recovery windows",
    defaultControls: "Touch-anywhere joystick plus a bark button",
    winReplayPromise: "Save the salad faster by timing bark rallies and cleaner pushes.",
    difficultyVariants: DEFAULT_DIFFICULTY_VARIANTS,
  },
  {
    slug: "primordial-ascent",
    title: "PRIMORDIAL ASCENT",
    description: "Grapple your way out of a rising lava cavern using procedural physics.",
    tags: ["r3f", "physics", "procedural"],
    color: "#00ff66",
    motif: "primordial",
    secondaryAccent: "#ff3333",
    gradient: "linear-gradient(135deg, #00ff66, #ff3333)",
    pillars: ["Vertical escape", "Grapple readability", "Lava pressure"],
    presentation:
      "The player should read the cavern as a climb: cyan grapple ceilings, green rest surfaces, and red lava pressure form the core visual grammar.",
    sceneDirection:
      "Low ambient light, strong emissive targets, fog, and a rising lava plane turn simple procedural geometry into a hostile vertical space.",
    responsiveDirection:
      "Pointer-lock play remains fullscreen-first, while the root fills the cabinet island for smoke tests and preview without imposing viewport height.",
    coreMessage: "A controlled grapple rhythm turns panic into ascent.",
    coreLoop:
      "Climb anchor routes, lock tethers, rest on shelves, manage lava distance, reach air pockets.",
    sessionTarget: "8-15 minute cavern climb",
    pressureType: "Lava is a pacing signal in standard and a chase wall in challenge",
    defaultControls: "Touch-anywhere joystick and grapple action, with desktop pointer parity",
    winReplayPromise: "Climb higher routes by reading anchors and preserving recovery shelves.",
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
