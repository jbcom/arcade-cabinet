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
    slug: "gridizen",
    title: "GRIDIZEN",
    description: "Found a settlement, route data, and keep a living grid online.",
    tags: ["r3f", "strategy", "city"],
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #22c55e, #155e75)",
    pillars: ["City legibility", "Infrastructure feedback", "Calm civic iteration"],
    presentation:
      "Gridizen should read as a model-table city: terrain, roads, utilities, and warnings must be distinguishable even on a phone.",
    sceneDirection:
      "A restrained civic palette, day/night lighting, and icon-like warnings keep the terrain scannable while still giving the city a living rhythm.",
    responsiveDirection:
      "The camera targets the city center and allows zoom without panning away from the model, preserving control on touch and mouse.",
  },
  {
    slug: "mega-track",
    title: "MEGA TRACK",
    description: "Race a high-speed machine through a reactive 3D track.",
    tags: ["r3f", "racing", "action"],
    color: "#fb7185",
    gradient: "linear-gradient(135deg, #fb7185, #7c2d12)",
    pillars: ["Instant lane reads", "Toy-scale speed", "Impact clarity"],
    presentation:
      "The track should feel like an exaggerated tabletop racer with bold lane color, simple obstacles, and a camera that sells speed without hiding upcoming decisions.",
    sceneDirection:
      "High-saturation track strips, a low chase camera, and forward fog make distance readable and keep the car silhouette central.",
    responsiveDirection:
      "Controls reduce to left/right lane choice and the canvas fills its parent, so the same run works in a narrow Android shell or wide cabinet slot.",
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
      "The scene is a small arena where otter, goats, water, and goal are always visible enough to plan a rescue route.",
    sceneDirection:
      "Bright pasture, blue water, warm goal marker, and soft animal materials keep the tone playful while preserving collision readability.",
    responsiveDirection:
      "The arena camera frames all gameplay in one parent-filling canvas, avoiding hidden offscreen threats on mobile.",
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
    slug: "protocol-snw",
    title: "PROTOCOL: SNW",
    description: "Tactical survival combat protocol in a shifting neon void.",
    tags: ["r3f", "tactical", "combat"],
    color: "#2dd4bf",
    gradient: "linear-gradient(135deg, #2dd4bf, #042f2e)",
    pillars: ["Combat perimeter", "Neon target clarity", "System health pressure"],
    presentation:
      "The player reads the void as a tactical firing range: enemies, crosshair, integrity, and wave pressure are more important than environmental detail.",
    sceneDirection:
      "Dark teal space, restrained directional light, and cyan UI create a cold protocol mood while keeping targets high contrast.",
    responsiveDirection:
      "The scene fills desktop, mobile, and Android shells; HUD panels stay compact so the crosshair and threat lane remain open.",
  },
  {
    slug: "reach-for-the-sky",
    title: "REACH FOR THE SKY",
    description: "Architect, manage, and evolve your vertical skyscraper empire.",
    tags: ["r3f", "simulation", "management"],
    color: "#1e88e5",
    gradient: "linear-gradient(135deg, #1e88e5, #43a047)",
    pillars: ["Vertical ambition", "Readable stacking", "Day-cycle economy"],
    presentation:
      "The skyscraper is a model rising into frame: the player should understand every placed module as part of an upward economic machine.",
    sceneDirection:
      "Sky gradients, sun movement, and clean module colors keep the tower legible while making height feel aspirational.",
    responsiveDirection:
      "Map controls and camera distance must keep the tower centered across mouse, touch, and Android WebView inputs.",
  },
  {
    slug: "realmwalker",
    title: "REALMWALKER",
    description: "High-fantasy adventure through shifting realms and mystical relics.",
    tags: ["r3f", "fantasy", "adventure"],
    color: "#c084fc",
    gradient: "linear-gradient(135deg, #c084fc, #4c1d95)",
    pillars: ["Mythic traversal", "Zone-shift identity", "Relic risk/reward"],
    presentation:
      "The player should feel like a small figure crossing unstable realms, with color shifts and silhouettes carrying more weight than dense geometry.",
    sceneDirection:
      "Zone color, mist, pillars, and a bright player weapon establish fantasy space while preserving motion readability.",
    responsiveDirection:
      "Third-person camera follow keeps the player centered and avoids precision UI so mobile and Android remain viable.",
  },
  {
    slug: "sim-soviet",
    title: "SIM SOVIET 3000",
    description: "Manage a Soviet-era city in this strategic simulation.",
    tags: ["r3f", "simulation", "strategy"],
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444, #f97316)",
    pillars: ["Command-table planning", "Quota pressure", "Utilities as visible systems"],
    presentation:
      "The city should read like a physical planning table: buildings are simple blocks, quota is constant pressure, and tool choice is always close.",
    sceneDirection:
      "Cold slate terrain, red/orange civic accents, and a fixed isometric presentation make political pressure and infrastructure state visible.",
    responsiveDirection:
      "The whole board stays within the camera target, with HUD and building palette occupying predictable edges on mobile and desktop.",
  },
  {
    slug: "titan-mech",
    title: "TITAN MECH",
    description: "Pilot a giant mechanical titan through a field of hazardous obstacles.",
    tags: ["r3f", "cockpit", "action"],
    color: "#f43f5e",
    gradient: "linear-gradient(135deg, #f43f5e, #4c0519)",
    pillars: ["Heavy chassis control", "Arena navigation", "Systems-first combat"],
    presentation:
      "Titan Mech should feel like piloting mass through an industrial test arena, with obstacles arranged as deliberate cover and navigation challenges.",
    sceneDirection:
      "Dark metal ground, cyan telemetry lights, ring markings, and hard directional shadows sell scale without cluttering the combat field.",
    responsiveDirection:
      "The camera follows the mech, and the arena layout is deterministic so desktop, mobile web, and Android builds render the same authored space.",
  },
  {
    slug: "voxel-realms",
    title: "VOXEL REALMS",
    description: "Explore and survive in an infinite, procedurally generated voxel world.",
    tags: ["r3f", "procedural", "survival"],
    color: "#84cc16",
    gradient: "linear-gradient(135deg, #84cc16, #064e3b)",
    pillars: ["Procedural wonder", "Safe spawn readability", "First-person survival"],
    presentation:
      "The world should begin from a designed spawn pad that proves scale and orientation while terrain streams in around the player.",
    sceneDirection:
      "Natural voxel greens, dirt, stone, sky, and a blue horizon beacon replace debug cubes with a readable survival starting point.",
    responsiveDirection:
      "Pointer-lock exploration fills the parent viewport and the Android shell uses dynamic viewport units so the horizon stays stable under mobile browser chrome.",
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
