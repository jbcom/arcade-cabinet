# Couch-Friendly Cabinet Loop Pass

This pass reframes the cabinet around twelve launch-track cartridges: the active nine plus Beppo Laughs, Cognitive Dissonance, and Farm Follies. The default is `standard`, with `cozy` and `challenge` exposed before play on the shared cartridge start frame.

## Shared Rules

- Standard mode targets an 8-15 minute couch run with at least one recoverable mistake.
- Stress is telegraphed and recoverable by default. Challenge mode is where fail-fast pressure belongs.
- Game identity is expressed through a shared cartridge frame plus unique label motif, color, voice, and rules card.
- Browser, mobile web, and Android use the same deterministic logic; UI/R3F stay under `app/`, simulation under `src/`, and assets under `public/`.

## Paper Playtest Matrix

| Game | First 15 seconds | 3-minute comprehension | 8-15 minute arc | Failure recovery | Mobile input | Replay hook |
| --- | --- | --- | --- | --- | --- | --- |
| Bioluminescent Sea | Read glow chain, headlamp, and first beacon. | Understand light route, nearest threat, and trench marker. | Collect glow through landmark chains and return with route mastery. | Longer oxygen budget and readable predator glints. | Touch-anywhere swim heading. | Cleaner beacon routes and higher chain score. |
| Cosmic Gardener | Launch, flippers, active constellation are visible. | Player knows stars must connect into patterns. | Complete several constellations with bloom previews. | Generous balls and recovery blooms in standard. | Large flipper/launch buttons. | More complete patterns and stronger resonance chains. |
| Enchanted Forest | Draw the visible rune cue and see shield/heal/purify feedback. | Learn target trees, mana readiness, and alternating spells builds harmony. | Defend readable grove waves with guided spell cadence. | Waves are cadence-based with target lighting instead of sudden failure spikes. | Pointer/touch rune drawing. | Better spell grammar and longer harmony runs. |
| Entropy Edge | Anchor, player, blocked cells, and reserve read immediately. | Secure anchors and learn resonance surge value. | Stabilize multiple sectors with reserve carryover. | Standard reserves replace the short forced timer. | Touch-anywhere joystick. | Higher-sector anchor chains and surge clears. |
| Mega Track | Lane, car, hazard silhouettes, and integrity read first. | Clean passes build overdrive; impacts cost repairable integrity. | Run a cup with checkpoint-like recovery and overdrive. | Standard damage is reduced and integrity recovers slowly. | Lane controls plus touch steering. | Cleaner cups and longer overdrive streaks. |
| Otterly Chaotic | Salad, otter, goats, bark, and goal are visible. | Goat intent and bark rally window are understood. | Rescue salad through a readable chase arena. | Bark heals and goat damage is gentler in standard. | Touch-anywhere joystick plus bark. | Faster rescues and cleaner bark timing. |
| Overcast Glacier | Lanes, cocoa, kick, photo, and warmth are visible. | Cocoa recovers warmth; snowmen/glitches have clear answers. | Clear glacier segments with combo and warmth control. | Warmth drain is gentle in standard. | Touch-anywhere steering plus action buttons. | Longer routes and cleaner cocoa/photo chains. |
| Primordial Ascent | Lava, anchors, shelves, and altitude read immediately. | Grapple rhythm and safe shelves become the plan. | Climb through anchor routes toward air pockets. | Standard lava speed is reduced from the old pressure curve. | Touch movement and grapple action. | Higher climbs and better tether choices. |
| Titan Mech: Overheat | Heat, energy, extraction, and cockpit mass read first. | Learn ore pylons, hopper, coolant, and firing feedback. | Complete extraction contracts while managing heat. | Standard heat gain is lower and cooling is stronger. | Touch-anywhere joystick plus action buttons. | Richer contracts and cleaner heat discipline. |
| Beppo Laughs | Center ring, composure, fear/despair, and junctions are visible. | Learn items unlock gates and backtracking costs despair. | Escape the circus maze by routing items to the exit. | Item pickups and breathing recovery restore composure. | Large junction choice buttons. | Higher-composure escapes through route mastery. |
| Cognitive Dissonance | Sphere, coherence, tension, and three rim controls are visible. | Match active color to lower tension and rebuild coherence. | Survive a stabilization shift as patterns rotate. | Coherence loss is reversible in standard. | Three thumb-sized rim controls. | Longer coherent shifts and cleaner prediction. |
| Farm Follies | Drop lanes, next animal, wobble, lives, and bank are visible. | Learn same-lane merges and bank as safety valve. | Stack, merge, use recovery lives, and bank score. | Floor-touch failure is replaced by lives and banking in standard. | Tap drop lanes and bank. | Higher animal tiers and smarter bank timing. |

## Implementation Notes

- `src/shared/sessionMode.ts` owns the shared `SessionMode`, launch game tuning, and default difficulty copy.
- `app/shared/ui/Cartridge.tsx` renders the shared mode selector and passes the selected mode into play.
- Beppo, Cognitive, and Farm are reduced imports: no standalone shell comes across, only deterministic loop logic and cartridge-native presentation.
- Direct Playwright remains diagnostic only; canonical screenshots and e2e flows stay in the Vitest Browser harness.
