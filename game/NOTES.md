# Tokyo's Journey — Play & source guide

## How to test it

- Run `npm run -s build`, then `npm run -s preview:local` and open `http://localhost:4181`. This preview uses local font copies; rebuild and reload after edits. If its font cache is missing, run `npm run -s smoke` first. The standard `npm run -s serve` uses Phaser's font CDN. For PNG-only edits, stop and reopen the Phaser play session so it rebuilds the assets.
- After cloning, run `npm run setup:phaser` to restore the CLI and engine for build, smoke, and play.
- Scenes: `title`, `story`, `home`, `dream-start`, `journey`, `ending`, `play` (Movement Meadow), `meadow` (treat meadow), `playground`, `parkmap`, `pause`, `settings`, `celebration`.
- On the title screen, Story Mode is at (201,378) and Playground is at (200,498). Tab focuses the choices and Enter or Space activates the focused button. With nothing focused, Enter or Space opens Playground. Press 2 for Story Mode.
- On mobile, choosing Story Mode or Playground requests fullscreen and landscape once per page load. If the phone cannot lock orientation, turn it sideways. Exiting fullscreen does not automatically reopen it; use the fullscreen button to enter it again.
- Title settings and fullscreen are at (1172,44) and (1236,44). Escape closes Settings.
- On the Story Mode screen, Start at Home is at (214,384), Movement Meadow is at (252,499), and Back to Menu is at (177,67). Tab focuses a choice and Enter or Space activates it. With nothing focused, Enter starts at home. Escape returns to the title.
- Home: start in the living room. Approach each door and use F, gamepad Y, or tap **Open door**. Walk into the open doorway to enter the next room. Use the other room’s matching door to come back. The camera frames one room at a time.
- Home controls: arrows/A-D to move, Shift to run, Space to jump, E to sit, C to crouch and crawl, and G to poop. Use F, gamepad Y, or tap a nearby action prompt. Greet someone or pick up the plushie to unlock treats. Eat from the bowl, then use the bed to enter the dream.
- Approach a family member or toy to see `home-interact-biscuit`. The prompt shows an F keycap, a Y keycap for gamepad, or a paw when touch controls are active. Walk away or start an interaction to see it disappear.
- Jump onto the four bedroom mattresses or Tokyo’s cushion with Space. Walk off the edge to come down. Inspect `home-bed-top-sandesh`, `home-bed-top-sushil`, `home-bed-top-parents`, `home-bed-top-senny-reshu`, and `home-bed-top-tokyo` for the landing surfaces.
- Check Tokyo standing, lowering into the taller bent-leg crawl, and rising again with C. Try the 44-unit clearance under `park-low-tunnel` and `low-tunnel`. At the treat bowl, inspect `home-resting-tokyo` to see frames 48–55 as Tokyo lowers her head, eats, and lifts it again.
- Home inspect: `tokyo` for the player and `home.room` in run state for the active room. The floor and door sills share y624. Living room has `home-light-switch` at x62 and `home-plushie` at x432. Inspect door faces as `home-door-<room>-to-<destination>`. Forward doors sit at x1320, x2728, x4136, and x5544.
- Family inspect: `home-sandesh` x1924, `home-sushil` x3371, `home-mom` x4555, `home-dad` x5265, `home-reshika` x5862 and `home-senny` x6199. After greeting, check `state` and `away`. A character stays engaged while Tokyo is within 104 screen units and starts resuming after two seconds outside that range.
- Inspect `home-pc-desk` in Senny and Reshu’s room to see the side-view workstation. Inspect `home-vanity` to see the mirror facing Reshu and the makeup within reach.
- In Sushil’s room, inspect `home-music-keyboard` beside the guitar amp and `home-sushil-pc-desk` between his stool and bed.
- Fetch: use Senny’s action, pick up `home-ball` and take it back to him. His PC activity resumes when Tokyo leaves even while the ball is on the floor. The shared bedroom has `home-bowl` x6752 and `home-bed` x6880.
- Carrying toys: pick up the plushie or ball, then walk, turn, crouch, or sit to see the mouth grip follow each pose. Inspect `tokyo` for the carry texture and `carrying` state. F puts down the toy in Level 0. The favorite plushie in the dream and the toys in the morning reunion also use these poses.
- Home debug: `cheat home-room living|sandesh|sushil|parents|senny-reshu [treats|bedtime]` starts in a room and optionally skips ahead to that phase. `cheat home-sofa <name>` previews that character seated on the living-room sofa.
- Dream: ←/→ move, Shift run, Space jump, F interact. Stage 1 portal is at far right. Stages 2–9 use `journey-exit-portal` near x1172. The shadow can end a run; wildlife briefly slows Tokyo.
- Stage goals: 2 open kennel latch x424 and find Sandesh; 3 find Sushil; 4 jump over the owl and find Dad; 5 jump past stray dogs and find Mom; 6 greet Mikan and Sora, then Reshika; 7 press moon then star, then find Senny; 8 pick up the plushie; 9 hug the family, wait for the morning cue, and wake near x1040.
- Dream lights protect Tokyo from the roaming shadow. Interact at each family member, cat, puzzle stone, toy or portal when its prompt appears. A caught Tokyo can retry the current level or wake at home.
- Dream inspect ids: `tokyo`, `roaming-dream-shadow` (stage 2–9), `dream-roaming-shadow` (stage 1), `safe-light-*`, `dream-family-*`, `kennel-front-gate`, `city-cat-*`, `puzzle-moon-pad`, `puzzle-star-pad`, `favorite-plushie-on-floor`, `spring-reunion-*`, `journey-exit-portal`.
- Ending: greet the family, play fetch with Senny, or choose Dream Again.
- Gamepad: left stick moves, A jumps, X runs, LB crouches, B sits, RB poops, Y interacts, Start pauses. Touch uses left/right arrows to move, down to crouch, up to stand, and labeled Jump, Run, Sit, Poop and Interact buttons. The arrows are at the lower left; actions are at the lower right.
- Playground: M opens the map; Esc/P pauses; R starts a new day; N toggles day/night. Map destinations are x250/640/1030 at y185 and y310; Back to Tokyo is (640,667).
- Playground interactions: F at beds for Cozy paws; pick up sticks, greet the carrier for Fetch star, crouch at box 2 to hide, jump rocks for treats, crawl the tunnel, F at six bushes and six picnic foods, greet four people, befriend four shy dogs by sitting first, collect 12 treats, then use the portal at x6210 after all eight badges.
- Sky: `park-sun`/`park-moon` at (1060,174); clouds drift at y181–266; stars twinkle at night. HUD day/night (976,44), map (1042,44), fullscreen (1108,44), sound (1168,44), pause (1236,44).
- Debug cheats: `screen <scene>`; `dream 1-9`; `dream-win`; `park new|home|fetch|yard|garden|picnic|dogs|portal|<x>|status|night|complete`; `place start|jumps|tunnel|rest|flag`; `treats all|status`; `controls run|crouch hold|toggle`; `touch on|off|auto`; `fullscreen on|off`; `rotate on|off|toggle`.

## Map

- `dreamArt.ts`: pixel light effects, wildlife and shadow atlases, kennel gate, and puzzle tokens.
- `main.ts`: engine setup, asset loading, input bindings, scene registration and boot.
- `scenes/Title.ts`, `Story.ts`, `Home.ts`, `DreamStart.ts`, `Journey.ts`, `Ending.ts`: title, story mode, bedtime, dream stages and morning.
- `menuStyles.ts` shares the main-menu and Story Mode button styles.
- `journey.ts`: stage data, dream art loading, shared progress and stage transitions. `home.ts`: shared home art and state. `homeRooms.ts`: Level 0 room and station positions. `homeInterior.ts`: room backgrounds and furniture. `homeDoors.ts`: partitions, doors, and collisions.
- `homePrompt.ts` draws and positions the biscuit-shaped interaction button.
- `art.ts`, `scenery.ts`, `input.ts`: shared paint and gesture helpers; `entities/Tokyo.ts`, `entities/Treats.ts`, `entities/Droppings.ts`: player, treats and pile.
- `playground.ts`, `parkMap.ts`, `sky.ts`, `entities/ParkActivities.ts`, `entities/ParkWildlife.ts`: playground world, sky and activities.
- `scenes/Play.ts`, `meadow.ts`, `scenes/Playground.ts`, `ParkMap.ts`, `Celebration.ts`, `Pause.ts`, `Settings.ts`: legacy treat meadow, playground and menus.
- `settings.ts`, `mobile.ts`, `debug.ts`: preferences, touch layout and debug controls.
- `assets/dream/`: eight palette-reduced dream backgrounds; `assets/home/`, `assets/family/`: room and family art. `design/art/` catalogs the assets.
- `tokyoArt.ts` loads the 52 × 52 Tokyo atlases. Regenerate the atlases from the art sources with `scripts/prepare-tokyo-style.py`.
- `scripts/prepare-pixel-sprites.py`: packages the home props, selected park strips, and dream creatures.
- `scripts/prepare-dream-art.py`, `scripts/prepare-sky-sprites.ps1`, `scripts/prepare-playground-assets.ps1`: art processing.

## Simplifications

- Level 0 family members stay in their rooms during regular play. The sofa cheat previews a seated visit.
- Dream levels are single-screen side-view routes with keyboard/gamepad/touch movement and context interactions; no save/resume checkpoints between stages.
- Stage 7 reuses the familiar living room; stage 8 uses one collectible plushie, and stage 9 has one reunion interaction before the morning ending.
- The roaming shadow uses a simple follow-and-light-buffer behavior; the owl and stray dogs use horizontal patrols and briefly interrupt Tokyo on contact.
- The morning ending is playable but short: family greetings, fetch, and Dream Again.
- Playground discoveries last for one park day; control preferences persist. Buildings are scenery rather than interiors, sticks reset to the fetch lawn, and dogs use supplied poses.
- Night changes the sky and tint, not dynamic lighting. Tokyo's sit frames are reused for pooping; droppings are decorative and clear on scene changes.
