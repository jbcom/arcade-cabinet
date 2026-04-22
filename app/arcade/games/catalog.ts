export const games = [
  {
    slug: "bioluminescent-sea",
    title: "BIOLUMINESCENT SEA",
    description: "Descend into the deep ocean as a glowing collector of light.",
    tags: ["canvas", "framer-motion", "exploration"],
    color: "#4ecdc4",
    gradient: "linear-gradient(135deg, #4ecdc4, #051018)",
    pillars: ["Quiet navigation", "Light as currency", "Threats read as silhouettes"],
    presentation:
      "The player should feel small inside a layered ocean volume: bright collectible life sits close to the camera while predators read as darker, slower shapes at the edge of vision.",
    sceneDirection:
      "Use deep vertical gradients, sparse particulate motion, and soft cyan/magenta glow to create depth without losing touch clarity on phones.",
    responsiveDirection:
      "Canvas simulation sizes from its parent island, not the browser window, so it can run fullscreen, embedded in the cabinet, or inside an Android WebView.",
  },
  {
    slug: "cosmic-gardener",
    title: "COSMIC GARDENER",
    description: "Plant stars and build constellations in a hybrid pinball puzzle.",
    tags: ["react", "framer-motion", "puzzle"],
    color: "#fbbf24",
    gradient: "linear-gradient(135deg, #fbbf24, #ec4899)",
    pillars: ["Pinball energy", "Readable constellation routing", "Wonder without visual clutter"],
    presentation:
      "The board is a cosmic tabletop: the player reads flippers and launch power first, then star growth, then constellation goals.",
    sceneDirection:
      "Use warm star golds against a cool nebula field, with animated energy streams that clarify cause and effect instead of becoming decoration.",
    responsiveDirection:
      "All board coordinates stay percentage-based so the table composes vertically on mobile and wider as a cabinet island on desktop.",
  },
  {
    slug: "enchanted-forest",
    title: "ENCHANTED FOREST",
    description: "Protect sacred trees using musical runes and spirit magic.",
    tags: ["react", "tone.js", "manga"],
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #7c3aed)",
    pillars: ["Gesture spellcasting", "Sacred grove protection", "Music reinforces intent"],
    presentation:
      "The grove should feel theatrical and hand-authored: trees form a readable stage line, corruption travels as visible waves, and rune drawing owns the foreground.",
    sceneDirection:
      "Emerald, violet, and warm firefly accents separate safe life, magic, and corruption while keeping touch trails high contrast.",
    responsiveDirection:
      "Tree positions and drawing coordinates remain percentage-based, preserving the same tactical composition on portrait phones and desktop cabinets.",
  },
  {
    slug: "entropy-edge",
    title: "ENTROPY EDGE",
    description: "Hold a collapsing resonance field together at the edge of failure.",
    tags: ["r3f", "simulation", "systems"],
    color: "#38bdf8",
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
  },
  {
    slug: "mega-track",
    title: "MEGA TRACK",
    description: "Thread a high-speed machine through a deterministic hazard ribbon.",
    tags: ["r3f", "racing", "action"],
    color: "#fb7185",
    gradient: "linear-gradient(135deg, #fb7185, #7c2d12)",
    pillars: ["Instant lane reads", "Toy-scale speed", "Impact clarity"],
    presentation:
      "The track should feel like an exaggerated tabletop racer with a dark asphalt ribbon, bright rails, readable hazard choreography, and a camera that sells speed without hiding upcoming decisions.",
    sceneDirection:
      "Cyan and yellow rails, checkpoint gates, composite player and pace cars, cone/barrier silhouettes, and forward fog make distance readable while keeping the car central.",
    responsiveDirection:
      "Controls reduce to left/right lane choice with keyboard and page-mode touch buttons, so the same deterministic run works in a narrow Android shell or wide cabinet viewport.",
  },
  {
    slug: "overcast-glacier",
    title: "OVERCAST: GLACIER",
    description: "Ski a corrupted glacier as a kung-fu kitten fighting snowmen and glitches.",
    tags: ["react", "lane-runner", "action"],
    color: "#7dd3fc",
    gradient: "linear-gradient(135deg, #7dd3fc, #0f172a 48%, #10b981)",
    pillars: ["Downhill clarity", "Kung-fu interruption", "Warmth survival"],
    presentation:
      "The player should immediately read Kicks, three downhill lanes, cocoa warmth pickups, snowman threats, and glitch photo targets without needing the original larger Overcast scope.",
    sceneDirection:
      "Midnight arctic blue, scanline snow, matrix green glitches, cocoa warmth, and bright white snowmen give the reduced loop a strong label identity while staying mobile-readable.",
    responsiveDirection:
      "The lane surface and HUD use parent-relative geometry, and touch-anywhere joystick steering shares the same deterministic controls as keyboard play.",
  },
  {
    slug: "otterly-chaotic",
    title: "OTTERLY CHAOTIC",
    description: "Navigate a chaotic otter through a series of wild challenges.",
    tags: ["r3f", "physics", "action"],
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
    pillars: ["Protect the salad", "Readable chase triangle", "Comedic physicality"],
    presentation:
      "The scene is a small chase arena where otter, goats, salad, water, and goal are always visible enough to plan a rescue route.",
    sceneDirection:
      "Bright pasture, blue water, warm crater marker, fence rails, reeds, composite salad leaves, and soft animal materials keep the tone playful while preserving collision readability.",
    responsiveDirection:
      "The fixed arena camera widens for portrait, and page-mode touch controls keep mobile and Android play equivalent to keyboard input.",
  },
  {
    slug: "primordial-ascent",
    title: "PRIMORDIAL ASCENT",
    description: "Grapple your way out of a rising lava cavern using procedural physics.",
    tags: ["r3f", "physics", "procedural"],
    color: "#00ff66",
    gradient: "linear-gradient(135deg, #00ff66, #ff3333)",
    pillars: ["Vertical escape", "Grapple readability", "Lava pressure"],
    presentation:
      "The player should read the cavern as a climb: cyan grapple ceilings, green rest surfaces, and red lava pressure form the core visual grammar.",
    sceneDirection:
      "Low ambient light, strong emissive targets, fog, and a rising lava plane turn simple procedural geometry into a hostile vertical space.",
    responsiveDirection:
      "Pointer-lock play remains fullscreen-first, while the root fills the cabinet island for smoke tests and preview without imposing viewport height.",
  },
  {
    slug: "titan-mech",
    title: "TITAN MECH: OVERHEAT",
    description: "Pilot a heat-stressed extraction titan through ore pylons and reactor pressure.",
    tags: ["r3f", "cockpit", "action"],
    color: "#f43f5e",
    gradient: "linear-gradient(135deg, #f43f5e, #4c0519)",
    pillars: ["Heavy chassis control", "Heat economy", "Industrial extraction"],
    presentation:
      "Titan Mech should feel like piloting mass through a hostile extraction yard: ore pylons, heat pressure, weapons, coolant, and hopper ejection all compete for attention.",
    sceneDirection:
      "Dark metal ground, orange ore rigs, cyan telemetry lights, ring markings, and hard directional shadows sell scale without cluttering the combat field.",
    responsiveDirection:
      "The camera follows the mech, and the arena layout is deterministic so desktop, mobile web, and Android builds render the same authored space.",
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
