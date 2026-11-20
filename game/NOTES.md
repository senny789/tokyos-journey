# Tokyo's Journey — movement and treats update

## How to test it

- Start with `npm run -s serve`, or use `npm run -s play -- "scene play; shot"`.
- Scenes: `title`, `play`, `pause`, and `settings`.
- Treats & Flag:
  - 10 hovering treats float across the meadow (`treat-1`..`treat-10`), placed on paths, ledges, and inside the low tunnel.
  - Walk, leap, or crawl into a treat to collect it (pop animation, sparkle burst, count increments).
  - Top-left HUD displays live `TREATS: X / 10`.
  - Once all 10 treats are collected, the golden victory flag (`victory-flag`) raises at x2280 and a drop-in notification banner appears: "★ ALL TREATS COLLECTED! ★".
- Settings Screen & Control Toggles:
  - Open via Settings button (gear icon) on Title, Play HUD, or Pause menu, or `cheat screen settings`.
  - Controls section: toggles for Run Mode (HOLD / TOGGLE) and Crouch Mode (HOLD / TOGGLE).
  - In Toggle mode, single-tap Shift/Run or Down/Crouch to toggle sprint or crouch on/off.
  - Mobile screens default to Toggle mode for both run and crouch for effortless touchscreen play.
  - Persistent settings stored with `game.save`.
- Horizontal Rotation:
  - Rotate button (redo icon) in top-right HUD and Settings screen triggers landscape mode (`rotateToHorizontal()`).
- Debug cheats:
  - `cheat treats all`: instantly collect all 10 treats, raising the flag and showing completion banner.
  - `cheat screen title|play|pause|settings`: open any screen.
  - `cheat controls run toggle|hold` / `cheat controls crouch toggle|hold`: switch input modes.
  - `cheat rotate on|off|toggle`: toggle horizontal rotation mode.
  - `cheat place start|jumps|tunnel|rest|flag`: place Tokyo at designated area.
  - `cheat touch on|off|auto`: force mobile touch controls.

## Map

- `main.ts`: preload, assets, touch/keyboard bindings, scenes registration (`title`, `play`, `pause`, `settings`).
- `settings.ts`: controls configuration (run/crouch hold vs toggle), mobile defaults, and `game.save` persistence.
- `mobile.ts`: mobile view detection, touch overrides, fullscreen and horizontal rotation helpers.
- `entities/Treats.ts`: hovering treats placement, floating animation, collection collision, victory flag, and banner.
- `entities/Tokyo.ts`: state machine with run/crouch toggle integration and physics-aware crouching.
- `scenes/Settings.ts`: dedicated settings screen with controls configuration, orientation, fullscreen, and audio.
- `scenes/Play.ts`: main meadow gameplay, treats integration, HUD treat counter, rotate and settings buttons.
- `scenes/Title.ts` & `scenes/Pause.ts`: navigation to settings screen and rotate controls.
- `art.ts`: procedural textures including `goal-flag`, `sparkle`, `treat-icon`, tunnel, signposts.
- `debug.ts`: cheats for screen, treats, controls, touch, fullscreen, and placement.
- `assets/treat-atlas.png`: 4-frame 48x48 pixel treat items atlas.

## Scope and limitations

- All 10 treats are collectible, with persistent HUD counters, victory flag raising, and completion banner.
- Both Run and Crouch toggle behaviors work across keyboard, gamepad, and mobile touch buttons.
- Screen orientation uses standard Screen Orientation API coupled with fullscreen requests.
