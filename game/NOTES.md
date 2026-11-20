# Tokyo's Journey — movement prototype

## How to test it

- Start with `npm run -s serve`, or use `npm run -s play -- "shot"`.
- Scenes: `title`, `play`, and the `pause` overlay. This is a practice area, without a win/lose condition.
- Start from the title with Enter, Space or Explore the meadow.
- Arrows or A/D: walk at 160 px/s. Hold Shift to run at 300 px/s. Both directions mirror Tokyo's sprites.
- Space, W or Up: jump. Hold for a full jump; release for a short hop. No double jumping.
- Down, S or C: crouch and crawl at 70 px/s. Her chin rests on the ground; tucked legs and a low belly give her a 28px collision height instead of 60px.
- Lowering/standing takes 0.24s using eight poses. Crawl uses eight alternating-leg frames; stationary crouch holds its resting pose.
- Walk/run/crawl share a distance-driven gait phase. Pressing Down does not reduce the horizontal axis; Down+Right and C+Right both crawl at 70 px/s.
- Check entering crouch from idle/run, stopping without releasing crouch, left/right crawl, releasing under the tunnel, and releasing crouch then jumping.
- E: sit or stand. Moving, crouching or jumping also leaves sitting, with a short stand-up transition.
- P/Escape or Pause: pause. Resume continues; Restart resets the current practice entry; Title returns to the title.
- Sound button toggles mute; this first prototype deliberately has no audio.
- Fullscreen button toggles fullscreen mode across Title, Play, and Pause (native API with iOS CSS fallback).
- Mobile touch controls show on touch devices, small screens, or with ?mobile / ?touch:
  - Left thumbstick: drag left/right to walk (or run when holding Run), pull down to crouch and crawl.
  - Right action buttons: JUMP (leap), RUN (sprint at 300 px/s), CROUCH (crouch/crawl), SIT (toggle sit/stand).
  - Footer hints dynamically adapt between keyboard shortcuts and touch instructions.
- R resets Tokyo to the starting area. Gamepad: left stick, A jump, X run, LB crouch, B sit, Start pause.
- The footer highlights Tokyo's state and displays her actual horizontal velocity.
- The world is 2400x720. Floor top: y560. Tokyo starts at x220. Camera follows her horizontally.
- Jump ledges: x620/y474, x850/y392, x1080/y450, x2030/y456. The floor is continuous and safe.
- Low tunnel: x1510..1770, underside y516. Stand is blocked; crouch fits. She cannot stand until completely clear.
- Debug controls:
  - `screen title|play`: open a screen.
  - `place start|jumps|tunnel|rest`: enter the relevant practice area.
  - `touch on|off|auto`: force or toggle on-screen mobile touch controls.
  - `fullscreen on|off`: toggle fullscreen mode.
- Inspector ids/prefixes: `tokyo`, `tokyo-body`, `ground`, `ledge-1`..`ledge-4`, `low-tunnel`, `tokyo-shadow`, `touch-stick`, `touch-button`.
- `inspect tokyo` reports state, frame, facing, grounded, posture, position, velocity, gait, crouchAmount/crouchMotion and jump/sitting timers.

## Map

- `main.ts`: preload, touch/keyboard/gamepad input bindings, scenes and debug registration.
- `mobile.ts`: mobile view detection, touch override controls, and reactive fullscreen button helper.
- `entities/Tokyo.ts`: Tokyo's state machine, physics body, crouch clearance and animation frames.
- `meadow.ts`: authored practice geometry, walls and signs.
- `scenery.ts`: grassland tiles, four tree variants, eight flower patches, distant hills/mountains and parallax.
- `art.ts`: pixel sky, tunnel, sign and shadow textures.
- `scenes/Title.ts`: title, animated Tokyo, start control, and fullscreen button.
- `scenes/Play.ts`: practice scene, camera, input hints, fullscreen button, and state display.
- `scenes/Pause.ts`: pause controls and fullscreen button.
- `debug.ts`: inspector state, practice-area controls, touch toggle, and fullscreen cheat.
- `assets/tokyo.png`: custom 8x6 atlas, 64x64 per frame; no Phaser sprite service used.
- `assets/tokyo-crouch.png`: 16-frame posture/crawl atlas, matching Tokyo's scale, baseline and original standing entry.
- `assets/grassland.png`, `trees.png`, `hills.png`, `mountains.png`, `flowers.png`: generated 16-bit environment sprites.
- `manifest.json`: pixel-art rendering, local asset packaging, physics and block UI.
- `../scripts/prepare-sprites.ps1`: repeatable slicing, nearest sampling and alpha normalization.
- `../scripts/prepare-crouch.ps1`: exports posture/crawl frames and updates the main atlas's crouch row.
- `../scripts/prepare-environment.ps1`: terrain/layer exports and aligned tree/flower atlases.
- `../design/art/`: original generated sprite sheet and art prompt.
- `../design/art/environment/`: environment source images and full generation prompts.
- `../design/research/spritecast.md`: sourced SpriteCast suitability research.

## Scope and limitations

- Idle plus all five requested actions are present. Run/walk loop; jumps follow velocity; sitting has entry/exit frames.
- This is the character/movement milestone. No enemies, combat, levels, collectibles, story or audio yet.
- Frames are AI-generated and normalized for consistent size and baseline; paws are not a biomechanical simulation.
- A small foot probe supplements physical contacts across posture changes and sleeping-body frames.
- Player bodies collide with terrain only; old/new posture bodies cannot push one another during replacement.
- SpriteCast was researched but not installed: its animal path currently covers walk/idle, not all requested actions.
