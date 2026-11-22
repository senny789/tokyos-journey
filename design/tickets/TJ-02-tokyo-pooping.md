# TJ-02 · Let Tokyo poop

**Status** — Implemented locally. The keyboard action was verified in Playground using the local preview. Movement Meadow, controller input, and touch input still need a playtest.

Tokyo can squat and leave a small cartoon pile while standing on solid ground.

## Acceptance criteria

- [ ] In Playground and Movement Meadow, G on keyboard, RB on controller, and the POOP touch button trigger the action on solid ground.
- [x] In the Playground keyboard test, Tokyo leaves a pixel-art pile behind her and can walk away afterward.
- [ ] The action is unavailable while airborne. The pile stays at the drop spot and fades after about 12 seconds.

## Test

Run `npm run -s preview:local` from the project folder and open `http://127.0.0.1:4181/`. Choose Playground, press G while Tokyo is on the ground, and walk away to see the pile. For Movement Meadow, choose Story Mode and begin Chapter 1.

The current implementation uses Tokyo's sit frames for the squat and a dedicated pile sprite. [Game test notes](../../game/NOTES.md)
