# Tokyo's Journey — Sprite Catalog

All 12 requested sprite sheets were generated in crisp authentic 16-bit SNES pixel art style, matching the color palette, dark earthy outlines, and 2D platformer side-elevation perspective of Tokyo's Journey.

The generated source images are archived in `design/art/sources/`, and their extracted 32-bit transparent PNG versions are located in `game/assets/` and registered in `game/manifest.json`.

---

## In-game sprite pass

The [main-menu background](../../game/assets/title-home-dusk.png) was generated from the existing title screen as a pixel-art reference. The prompt placed a warmly lit home at dusk on the right and kept the left side in the shade for the menu. The 640 × 360 plate leaves the path clear for Tokyo’s existing seated animation.

The [Story Mode background](../../game/assets/story-living-room.png) uses the dusk exterior and the in-game living room as references. The prompt asked for an olive sofa, terracotta curtains, and a floor lamp on the right, with a quiet shaded wall for the menu on the left. The 640 × 360 plate leaves the rug clear for Tokyo’s existing plushie-carry animation.

The [Sprite Cast PixelKit packer](../../scripts/prepare-pixel-sprites.py) prepares the new home props and the `park-*-pixel.png` strips for dogs, people, houses, beds, boxes, rocks, and food. It retains the source strips and preserves each frame's bounds and ground anchor.

The [dream creature source](dream-creatures-source.png) was made with built-in ImageGen using Tokyo's game sprite for pixel size and shape language and the forest and city scenes for palette. The prompt asked for a transparent four-column, two-row sheet with a folded and flapping owl, alert and blinking poses for ginger Mikan and blue-gray Sora, and two stalking poses for the plum-colored shadow. The same packer exports the creature sheets with transparent backgrounds and shared baselines. The kennel gate, latch, light patches, and puzzle tokens are drawn on small pixel grids in [dreamArt.ts](../../game/dreamArt.ts).

## 1. Hovering Treats
- **Source:** `design/art/sources/treats-source.jpg`
- **Runtime Asset:** `game/assets/treats.png`
- **Description:** 4 distinct floating treat collectibles for Tokyo to find and eat as they hover across the levels:
  1. Golden bone biscuit with sparkling yellow pixel highlights
  2. Honey-glazed round dog biscuit
  3. Star-shaped golden dog cookie
  4. Savory dried meat strip treat
- **Visuals:** Warm amber/honey palette, soft glowing sparkles, floating aura.

## 2. Rift Portal

Built-in ImageGen used a Level 1 game frame as a pixel-scale reference for the amber-and-aqua portal. Sprite Cast PixelKit reduced the two states into 64 × 80 px transparent frames with a common ground anchor at row 76. Frame 0 is the muted ring. The next three frames share a luminous turquoise center and gold ribbons with a palette pulse. The game plays frames 1, 2, 3, 2 at 5 FPS using zero-based indices. Both states hover above the ground with a gentle sway. The open state adds a halo that follows the ring, light that sweeps upward through its center, and two sparks orbiting the rim. [Portal sprite sheet](../../game/assets/rift-portal.png) · [Animation and anchor](../../game/riftPortal.ts)

<details>
<summary>ImageGen prompt</summary>

```text
Generate one transparent RGBA sprite sheet for a friendly glowing portal in Tokyo's Journey, a crisp 16-bit pixel-art side-view platformer. Use the supplied game screenshot ONLY as reference for pixel scale, art direction and the dark blue scene. Invent a warm, magical visual with a smooth vertical oval of airborne light. The portal is two flowing ribbons of amber and aqua energy that curl together around a brightly illuminated turquoise center, like wisps of sunlight catching on a swirl of water. The open oval is widest at the middle, about 0.60 times as wide as it is tall. All edges and arcs are soft in shape but rendered with crisply stepped square pixel clusters. A thin blue-teal shadow edge separates the outer ribbons from bright grass as well as midnight blue. Large coherent clusters of saturated teal, turquoise, buttery gold and small near-white highlights. A few rounded luminous flecks close to the rim.
Lay out exactly two states in equal side-by-side panels, with the complete transparent cutouts comfortably inside each panel and generous separation. LEFT: the sealed state is a dim hovering oval traced by two broken amber arcs and a small bronze-teal shadow rim, like a sleeping ring of light. Genuine transparent empty interior. It remains clearly visible in the dark. RIGHT: the open state has the same width, centerline and height, with a broad bright aqua interior formed by flowing diagonal ribbons and a radiant cream-gold and teal rim. Add a restrained handful of warm star flecks around the rim. The open center is completely filled with light in several broad value bands. Put the strongest pale colors near the center and upper arc. The open state should feel cheerful, magical and safe to approach. No cracks, points, eye or pupil, stone arch, metallic frame, pedestal, black void, characters, landscape, dark backdrop, interface, grid, divider, labels, typography or watermark. Use true transparent alpha around both sprites and keep any soft glow tight to the rim. The main forms should read at a display size of around 80 by 130 logical pixels.
```

</details>

## 3. Villain Dogs
- **Source:** `design/art/sources/villain-dogs-source.jpg`
- **Runtime Asset:** `game/assets/villain-dogs.png`
- **Description:** Multiple menacing dog foes designed to match Tokyo's canine proportions in side elevation:
  1. Mean black-and-tan Doberman with spiked collar and sharp alert ears
  2. Grumpy, stocky English Bulldog with protruding underbite and furrowed brow
  3. Scrappy, scruffy alley terrier with a rogue eyepatch
  4. Snarling sleek Rottweiler with an aggressive stance

## 4. Houses
- **Source:** `design/art/sources/houses-source.jpg`
- **Runtime Asset:** `game/assets/houses.png`
- **Description:** 4 distinct buildings for platformer background scenery:
  1. Cozy brick cottage with peaked roof, chimney, and flower window boxes
  2. Suburban two-story family home with a front porch and glowing warm windows
  3. Charming doghouse with a bright red pitched roof and a bone sign above the entrance
  4. Rustic wooden cabin with stone accents and a lantern

## 5. Boxes
- **Source:** `design/art/sources/boxes-source.jpg`
- **Runtime Asset:** `game/assets/boxes.png`
- **Description:** 6 boxes and crates for obstacles, jumping platforms, and exploration props:
  1. Sealed cardboard moving box with packing tape
  2. Open cardboard box with flaps folded out (for hiding or jumping into)
  3. Reinforced heavy wooden cargo crate
  4. Slatted wooden fruit/produce crate
  5. Stack of two cardboard boxes
  6. Mystery reward crate emblazoned with a golden paw print

## 6. Beds
- **Source:** `design/art/sources/beds-source.jpg`
- **Runtime Asset:** `game/assets/beds.png`
- **Description:** 4 cozy resting spots and dog bed props:
  1. Plush circular donut dog bed with soft plush rim and paw print motif
  2. Orthopedic rectangular dog bed with fluffy fleece lining and a bone pillow
  3. Cozy human wooden bed frame with colorful patchwork quilt and pillows
  4. Wicker basket filled with folded blankets and towels

## 7. Rocks
- **Source:** `design/art/sources/rocks-source.jpg`
- **Runtime Asset:** `game/assets/rocks.png`
- **Description:** 5-6 terrain boulders and jumping platforms:
  1. Large moss-topped rounded boulder (ideal jump ledge)
  2. Sharp jagged slate rock outcrop
  3. Smooth river stone
  4. Cluster of small stepping pebbles
  5. Flat slate ledge platform

## 8. Food
- **Source:** `design/art/sources/food-source.jpg`
- **Runtime Asset:** `game/assets/food.png`
- **Description:** 6 mouth-watering collectible food items:
  1. Red ceramic dog food bowl heaped with kibble
  2. Large roasted meat on bone
  3. String of plump savory links/sausages
  4. Wedge of Swiss cheese
  5. Golden cooked fish on a plate
  6. Layered dog birthday meat-cake with a slice cut out and a burning candle

## 9. People (NPCs)
- **Source:** `design/art/sources/people-source.jpg`
- **Runtime Asset:** `game/assets/people.png`
- **Description:** 4 friendly human NPCs in side view matching Tokyo's world scale:
  1. Tokyo's young owner waving cheerfully in casual clothes and sneakers
  2. Friendly mail carrier / postal worker carrying a satchel
  3. Cheerful boy crouching down to pet a dog
  4. Relaxed park visitor sitting and holding a dog leash

## 10. Bushes
- **Source:** `design/art/sources/bushes-source.jpg`
- **Runtime Asset:** `game/assets/bushes.png`
- **Description:** 6 lush foliage and shrubbery props:
  1. Round green bush dotted with bright red berries
  2. Low spreading sage-green meadow shrub
  3. Tall manicured garden hedge
  4. Flowering bush with delicate yellow/white blossoms
  5. Dense mossy grassland tuft
  6. Golden autumn amber bush

## 11. Insects
- **Source:** `design/art/sources/insects-source.jpg`
- **Runtime Asset:** `game/assets/insects.png`
- **Description:** 6 meadow wildlife creatures for ambient motion or chasing:
  1. Vibrant Monarch butterfly with spread wings
  2. Fuzzy yellow-and-black bumblebee with translucent wings
  3. Iridescent blue dragonfly in hover flight
  4. Spotted red ladybug
  5. Green meadow grasshopper poised to leap
  6. Shimmering emerald metallic beetle

## 12. Sticks
- **Source:** `design/art/sources/sticks-source.jpg`
- **Runtime Asset:** `game/assets/sticks.png`
- **Description:** 6 fetch sticks, twigs, and natural wooden obstacles:
  1. Thick knobby chew stick / classic dog fetch stick
  2. Forked Y-shaped branch
  3. Large fallen mossy branch with smaller twigs
  4. White birch wood stick with natural bark striations
  5. Bundle of dry kindling twigs bound with twine
  6. Fresh fallen twig with green leaves attached

## 13. Sun
- **Source:** `design/art/sources/sun-source.png`
- **Runtime Asset:** `game/assets/sun.png`
- **Dimensions:** 512x128 px (4 frames of 128x128 px)
- **Description:** 4 distinct sun variants for day/sunset scenes:
  1. Radiant midday sun with geometric pixel rays and warm golden core
  2. Golden sunset sun with concentric heat glow rings (amber, vermilion, and gold)
  3. Cheerful retro game sun with cute smiling face and rosy cheeks
  4. Sunburst flare with cross-spikes and diagonal sparkles

## 14. Clouds
- **Source:** `design/art/sources/clouds-source.png`
- **Runtime Asset:** `game/assets/clouds.png`
- **Dimensions:** 576x256 px (6 clouds in 2 rows of 3, 192x128 px per cell)
- **Description:** 6 distinct cloud types for meadow sky layers:
  1. Large fluffy cumulus cloud bank
  2. Medium drifting cloud (classic 3-puff side view)
  3. Small cute cloud puff
  4. Long wispy stratus cloud
  5. Warm sunset-kissed meadow cloud with peach/honey highlights
  6. Flat-bottomed classic retro platformer drifting cloud

## 15. Moon
- **Source:** `design/art/sources/moon-source.png`
- **Runtime Asset:** `game/assets/moon.png`
- **Dimensions:** 512x128 px (4 frames of 128x128 px)
- **Description:** 4 distinct moon phases for night and twilight skies:
  1. Luminous crescent sickle moon with clean dark outline
  2. Full moon with textured crater topography (mare shading)
  3. Cozy sleepy crescent moon with gentle closed eye curve
  4. Gibbous half-moon with detailed lunar shading

## 16. Stars
- **Source:** `design/art/sources/stars-source.png`
- **Runtime Asset:** `game/assets/stars.png`
- **Dimensions:** 192x128 px (6 star sprites in 2 rows of 3, 64x64 px per cell)
- **Description:** 6 twinkling celestial sparkles and effects:
  1. 4-point diamond twinkle star with bright white-yellow center
  2. Large cross sparkle star with radiant cyan/gold flares
  3. Ambient cluster of 5 shimmering meadow stars
  4. Shooting star / comet with curved gradient stardust trail
  5. 5-point classic golden retro platformer star
  6. Cosmic triple sparkle constellation group

---

## Processing Scripts
- `scripts/prepare-new-sprites.ps1`: copies raw sprite outputs and applies boundary flood-fill alpha keying to output clean 32-bit transparent PNGs.
- `scripts/generate-celestial-sprites.ps1`: generates the 16-bit pixel art celestial atlas sheets (`sun.png`, `clouds.png`, `moon.png`, `stars.png`).

