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

Stage 7 reuses the living-room environment from the home scene so it reads as a dream transformation of a familiar place. Characters, Tokyo, fireflies, lights, cats, dogs, puzzle stones and portals are layered as separate runtime sprites or interactive objects.

## Preparation

`scripts/prepare-dream-art.py` converts the generated source images found in the user's Codex generated-image folder into the eight runtime files. It uses the locally installed Sprite Cast `pixelkit` package for pixel reduction and palette mapping. The source images remain outside the repository; the processed game art is stored in `game/assets/dream/`.

## Level 1 cliffs

The [cliff atlas](../../game/assets/dream/cliffs.png) was made with built-in ImageGen using the original Level 1 preview and the [park rock strip](../../game/assets/park-rocks-pixel.png) as references.

Sprite Cast PixelKit reduced the four cutouts and mapped them to the [shared slate palette](graphic-style.md#level-1-slate). Each frame is 160 × 144 px. Row 5 is the landing rim, with the rim widths declared beside the frame numbers in `game/dreamArt.ts`. The rock faces fade into the pit.

<details>
<summary>ImageGen prompt</summary>

```text
Create ONE transparent PNG game-environment sprite sheet for an existing 16-bit pixel-art side-view platformer. References: the first image shows the destination scene and its existing cool indigo atmosphere and floating stone ledges. The second image is a material and pixel-edge reference for the charcoal slate rocks. This is a NEW set of standalone cliff sprites. Ignore the player, interface, and the old straight placeholder columns in the first image.
Lay out four completely isolated side-on cliff outcrops in a clean 2 by 2 arrangement on actual transparent alpha, centered in their quadrants, with ample clear separation and no gutters, labels, or other marks. The four should be long solid columns of natural, fractured slate bedrock as seen in a 2D platform game, extending far below their top. Each asset has ONE intentional, prominent, very nearly horizontal landable rim across most of its width at the very top. Make the line of the ground readable even on a dark indigo background. Give them natural jagged sides below this rim, stepped angular strata, a few broad stone planes and occasional chips connected to the main mass. Each is one continuous piece of solid rock; no upper spires above the flat rim, holes, floating fragments, grass, green moss, trees, lights, buildings, water, props, extra platforms, or fog outside the object.
The top-left is a narrow eroded needle mesa, long and slender with its plateau across most of the head, a little flare at the lower end. The top-right is a different slender to medium mesa with offset ledges and a subtle right shoulder. The bottom-left is a broader flat-topped bank, about twice the head width of the narrow mesa. The bottom-right is a medium-width outcrop with individual rock folds and a leftward shoulder. Keep the sprites comfortably within their quadrants, and keep their art density, lighting and apparent scale consistent. Pixel-art orthographic front view, deliberately grouped square pixels, SNES-style crisp stair-step contours, broad readable flat color clusters and sparse details. The rocks are desaturated slate-indigo and blue-gray with faint lilac undertones, the tops lighter and the vertical sides darkening into charcoal near the bottom. Keep the top edge lighter than the lower sides. Use restrained color and moderate contrast, a cohesive charcoal blue family, and a game-ready silhouette. No photo rendering, soft brush noise, isometric perspective, glow, floor plane or background.
```

</details>

## Level 1 floating ledges

Built-in ImageGen used the cliff atlas as the style reference for the [floating ledge atlas](../../game/assets/dream/floating-ledges.png). Sprite Cast PixelKit reduced the slabs and snapped them to the same slate palette as the cliff frames. The four 48 × 24 px frames share a landing rim on row 3. The engine scales each variant uniformly to match the collider width.

<details>
<summary>ImageGen prompt</summary>

```text
Create a transparent RGBA tileset sheet of exactly four STATIC floating stone ledges for Tokyo's Journey. The reference image is the game's approved cliff atlas and the only source of the stone art style. Each ledge should look like a small fragment that broke off the TOP of one of those cliffs and stayed suspended in air. Match the reference tightly: muted blue-violet slate, the same light, flat bluish gray stepped rim, large faceted diagonal fracture planes immediately below it, restrained block shading, and darkest charcoal indigo only at the underside and in creases. Broad dry stone pixels with the same visual weight as the cliff atlas. Square pixel-art blocks, crisp silhouette, simple readable chunks, no thin linework or pitch-black outline.
Output a tidy two-by-two sheet with equal-sized cells and wide clear gaps. Within each cell one complete isolated rock, with a nearly level, clearly visible landable top rim across most of its width. Shapes are shallow and horizontal with underside depth around one third of the top width. Vary the chipped corners and angular underside between the four pieces while preserving the same rim treatment and material. The rock faces should taper below the top, end in a handful of angular broken facets, and have a solid clean outline. A very shallow beveled top plane is allowed, as in the reference. Strict orthographic 2D side-view platformer angle. Make these comparable in size and detail, with no type, titles, grid lines, floating particles, deep pillars, rounded pebbles, moss, grass, glow, floor shadow, painted background, or semitransparent mist. Use real transparency around each rock silhouette.
```

</details>
