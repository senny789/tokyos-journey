# Dream stage art

Eight full-screen, original pixel scenes are used by the dream journey. Each file is 1280×720; Sprite Cast's PixelKit downsamples it into a restricted 36-color palette and scales it back up with nearest-neighbor pixels.

| Stage | Runtime file | Art direction |
|---|---|---|
| 1 — The dark place | `game/assets/dream/dark.png` | Deep indigo fog, a sparse floor, distant violet portal and a small pool of light. |
| 2 — The kennel | `game/assets/dream/kennel.png` | Rows of steel puppy cages, a gate and a narrow concrete corridor. |
| 3 — The first house | `game/assets/dream/night-house.png` | A dim familiar living room with blue window light and furniture silhouettes. |
| 4 — The dark forest | `game/assets/dream/forest.png` | Dense moonlit trees, ground-level fireflies and a winding trail. |
| 5 — The grassland | `game/assets/dream/grassland.png` | A sunny open field with a low horizon, tall grass and distant hills. |
| 6 — The city | `game/assets/dream/city.png` | A quiet neighborhood street with storefronts, parked cars and alley details. |
| 8 — The toy world | `game/assets/dream/toys.png` | A playful room filled with blocks, balls, plush animals and a bright path. |
| 9 — The spring outdoors | `game/assets/dream/spring.png` | Cherry blossoms, fresh green grass and a warm spring sky for the reunion. |

Stage 7 reuses the living-room environment from the home scene so it reads as a dream transformation of a familiar place. Characters, Tokyo, fireflies, lights, the shadow, cats, dogs, puzzle stones and portals are layered as separate runtime sprites or interactive objects.

## Preparation

`scripts/prepare-dream-art.py` converts the generated source images found in the user's Codex generated-image folder into the eight runtime files. It uses the locally installed Sprite Cast `pixelkit` package for pixel reduction and palette mapping. The source images remain outside the repository; the processed game art is stored in `game/assets/dream/`.
