# Tokyo's Journey — Playground & Story Mode

## How to test it
- `npm run -s build`; `npm run -s smoke -- --seconds 30`; `npm run -s play -- "shot"`.
- Scenes: `title`, `story`, `meadow` (chapter 1), `play` (playground), `parkmap`, `pause`, `settings`, `celebration`.
- Title: Playground button (380,455), Story Mode (900,455); Enter/Space opens Playground, 2 opens Story.
- Story: Begin chapter 1 (640,450) opens the existing ten-treat meadow; Choose a mode (640,540) returns.
- Move: A/D or arrows; Shift runs; Space/W/Up jumps; Down/C/S crouches; E sits; F interacts.
- Gamepad: left stick moves, A jumps, X runs, LB crouches, B sits, Y interacts, Start pauses.
- Touch: stick bottom-left; Jump, Run, Crouch, Sit bottom-right; Interact button (1178,665).
- M opens/closes the Park map; Esc/P pauses; R starts a fresh park day; N toggles day/night.
- HUD: day/night (976,44), map (1042,44), fullscreen (1108,44), sound (1168,44), pause (1236,44).
- Map destinations: x250/640/1030 at y185 and y310; Back to Tokyo at (640,667).
- Map travel preserves discoveries and carried stick. Restart/new day resets playground progress.
- Home x240..850: `home-cottage`, `tokyo-doghouse`, `park-bed-1/2`, `park-person-1`.
- F at a bed/doghouse sits Tokyo; remain seated for 2 seconds for Cozy paws. E or movement gets up.
- Fetch x1050..1700: `park-person-2`, `fetch-stick-1..6`, `neighborhood-house`.
- F picks up/swaps sticks. Return to the carrier at x1050 and F for Fetch star. F in open space tosses.
- Yard x1790..3000: `box-1..6`, `rock-1..3/5`, `park-low-tunnel`.
- Box 2 x1930: crouch + F earns Hide & seek; box 6 x2980: F opens the mystery reward.
- Jump onto the rock at x2290, then jump right onto the slate at x2420 for the highest treat.
- Crawl right from x2740 through the tunnel; two treats sit at y535 beneath its y516 ceiling.
- Garden x3250..3880: `sniff-bush-1..6`, `garden-insect-1..6`, remaining rock variants.
- F at all six bushes earns Super sniffer. Butterflies/bee/dragonfly fly; beetles crawl; grasshopper hops.
- Picnic x4060..4515: `picnic-food-1..6`; F samples all six for Picnic pal.
- People x470/1050/4340/4870: F greets each for Hello, neighbor; `park-person-1..4`.
- Cabin x4660: `park-cabin`; F switches day/night. All four house and bed variants appear.
- Dog club x5100/5350/5600/5850: `park-dog-1..4` (Dash, Dumpling, Patch, Bruno).
- Running close makes shy dogs back away. E to sit, then F to befriend; friends follow locally/play-bow.
- F at each dog earns Dog whisperer. Both pose rows of all four dogs animate.
- `park-treat-1..12`: collect by touching. Twelve treats earn Treat explorer.
- `park-portal` x6210: F explains requirements; all eight badges awaken its four-state art and celebration.
- Celebration: Keep playing (640,470); A new park day (640,555).
- Pause: Resume, Settings, Fullscreen, Restart, Title. Settings: run/crouch hold/toggle, rotation, fullscreen, Back.
- Inspect prefixes above identify objects; engine adds unique numeric suffixes. `inspect tokyo` shows motion.
- Debug: `cheat park new|home|fetch|yard|garden|picnic|dogs|portal|<x>` visits any area.
- Debug: `cheat park status` returns all activity/player state; `cheat park night` toggles sky.
- Debug: `cheat park complete` grants badges and visits the portal; F uses its normal outcome path.
- Debug: `cheat screen <scene>`, `cheat place start|jumps|tunnel|rest|flag` (story meadow).
- Debug: `cheat treats all|status` (story), `cheat controls run|crouch hold|toggle`.
- Debug: `cheat touch on|off|auto`, `cheat fullscreen on|off`, `cheat rotate on|off|toggle`.
- Sky: `park-sun` / `park-moon` at screen (1060,174); `park-cloud-0..5` drift at y181..266.
- `sky-star-0..14` twinkle at night, y139..329. N, HUD (976,44), or `cheat park night` toggles.
- Check title → Enter → N; click the sky toggle; `cheat park garden` checks sky after camera travel.

## Map
- `main.ts`: loads original/trimmed atlases; binds inputs; registers all scenes.
- `playground.ts`: visit state, areas, eight badges, messages and fresh-day reset.
- `parkMap.ts`: 6400px map, buildings, real platform surfaces, tunnel and night landscape tint.
- `sky.ts`: shared camera-pinned sun/moon, cloud drift and staggered star twinkles behind scenery.
- `entities/ParkActivities.ts`: contextual interactions, fetch, beds, bushes, food, treats and portal.
- `entities/ParkWildlife.ts`: dog patrol/trust/follow behaviors, six wildlife behaviors and sparkle effects.
- `scenes/Playground.ts`, `ParkMap.ts`, `Story.ts`, `Celebration.ts`: new gameplay and mode screens.
- `scenes/Title.ts`, `Pause.ts`, `Settings.ts`: navigation and ordered overlay menus.
- `entities/Tokyo.ts`: existing physics/animation controller; `entities/Treats.ts`: story collectibles/flag.
- `scenes/Play.ts`, `meadow.ts`: preserved Movement Meadow chapter.
- `scenery.ts`, `art.ts`: shared landscape and existing painted props; `input.ts`: gesture helpers.
- `settings.ts`, `mobile.ts`, `debug.ts`: saved control preferences, display/touch helpers, debug entry points.
- `scripts/prepare-playground-assets.ps1`: Windows PowerShell atlas extraction; writes `park-art.json` bounds.
- `assets/park-*.png`: existing sprite families trimmed into 13 runtime atlases.
- `assets/sky-*.png`: four new transparent sprites; generated originals/prompts in `design/sky-sprites/`.
- `scripts/prepare-sky-sprites.ps1`: trims/resizes generated art with nearest-neighbor sampling.

## Simplifications
- Story Mode contains the existing first chapter; later chapters are not built yet.
- Playground progress lasts for the current park day; only control preferences persist across reloads.
- No damage, timer or forced ending. Throwing is playful animation; sticks reset to the fetch lawn.
- Structures are scenery/context interactions; interiors are not separate levels. Dogs use two supplied poses.
- Night changes sky, stars, moon and cloud tint; there is no dynamic lighting.
- New sky art uses built-in image generation, without Phaser crew. Other art and sound are unchanged.
