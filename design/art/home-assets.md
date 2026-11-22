# Level 0 living-room assets

The [individual PNGs](../../game/assets/home/) are sized for the 1280 × 720 side-scrolling room. ImageGen drew the art. Sprite Cast’s local pixel tools cleared and sized the furniture and props. The matched state pairs share dimensions and align at the bottom.

| Files | Role |
| --- | --- |
| `room.png` | Sunset window and curtains, wall art, clock, baseboard, and wooden floor. |
| `pixel-sofa.png`, `pixel-armchair.png`, `pixel-coffee-table.png`, `pixel-sideboard.png`, `pixel-rug.png` | Separate furnishing sprites placed behind the family and Tokyo. |
| `pixel-lamp-on.png`, `pixel-lamp-off.png`, `pixel-light-switch.png` | The switch changes the lamp artwork and room lighting together. |
| `pixel-plushie.png`, `pixel-basket.png` | Tokyo’s carryable bunny plushie and the toy basket where it starts. |
| `pixel-ball.png` | Senny’s fetch ball, which can be carried and brought back for another throw. |
| `pixel-bowl-full.png`, `pixel-bowl-empty.png` | The treat bowl changes after Tokyo eats. |
| `pixel-bed.png` | Tokyo’s sleeping spot, which starts the fade into the dream after treats. |

The fetch ball uses an 11-pixel grid, and the bunny plushie uses a 19-pixel grid with its embroidered face retouched by hand. Sprite Cast PixelKit resamples the original props using the [sprite packer](../../scripts/prepare-pixel-sprites.py). The prologue, Puzzle House, and morning reunion use the same pixel furniture. The carryable bunny appears in the prologue, Toy World, and reunion.

## Generation prompts

- **Room.** Draw a warm, lived-in 16-bit pixel-art room at golden hour from a fixed side-on camera. Fill a 16:9 frame with dusty cream walls, a window showing teal hills and sunset, patterned terracotta curtains, a clock and two framed pictures, a walnut baseboard, and bare horizontal floorboards. Leave the lower wall and floor open for furniture and characters.
- **Furniture.** Draw a transparent four-column by two-row sheet, with an olive three-cushion sofa with pillows and throw, a terracotta armchair, a walnut coffee table with books and a mug, a brass lamp off, the same lamp on, a walnut sideboard with books and a plant, a teal dog bed with a blanket, and a woven terracotta and sage rug. Match the existing game’s side-view pixel outlines and warm palette.
- **Props.** Draw a transparent three-column by two-row sheet showing the floppy golden-brown bunny plushie with a muted sage scarf, the orange ball, matching full and empty teal biscuit bowls, a wicker toy basket with a rope toy, and a cream wall switch in a walnut frame. Keep the shapes legible at a small size.

## Bedroom furniture and doors

The built-in ImageGen tool used [the living-room sofa](../../game/assets/home/pixel-sofa.png) as the style reference. Sprite Cast PixelKit sized the furniture for a four-screen-pixel art grid and quantized each prop to 35 colors. The partitions and door panels are painted directly in [homeDoors.ts](../../game/homeDoors.ts).

- [Sandesh’s bed](../../game/assets/home/pixel-bed-sandesh.png), [Sushil’s bed](../../game/assets/home/pixel-bed-sushil.png), [parents’ bed](../../game/assets/home/pixel-bed-parents.png), and [shared bed](../../game/assets/home/pixel-bed-shared.png).
- [Laptop desk](../../game/assets/home/pixel-laptop-desk.png), [PC desk](../../game/assets/home/pixel-pc-desk.png), [vanity](../../game/assets/home/pixel-vanity.png), and [wardrobe](../../game/assets/home/pixel-wardrobe.png).

> Game-ready transparent RGBA sprite sheet for Tokyo’s Journey. Use the attached couch as reference for detailed 16-bit handcrafted pixel art, thick warm espresso outlines, connected flat color clusters and subtly warm upper-left light. Same side-scroller view, almost straight-on facing camera, show floor-contact feet and slightly visible tops. A perfectly regular TWO columns by TWO rows grid on a landscape canvas, four independent separated complete furniture sprites, one centered in each quadrant, transparent padding around each, no floor, text, environment, characters, shadows or intersecting objects outside cells.

- **Bedroom beds**. TOP LEFT a cozy narrow single bed with dark walnut headboard at the left, cream pillow, slate navy and muted blue striped thick blanket with warm piping, high contrast bedding folds. TOP RIGHT narrow single bed with honey wood rounded headboard at the left, oatmeal pillow and moss green quilt, extra folded warm plaid throw at the right foot. BOTTOM LEFT a prominent wider double bed with carved dark headboard at left, two cream pillows visible just enough in profile and dusty rose quilt with repeated understated stitched diamonds. BOTTOM RIGHT a wide shared bedroom bed with walnut headboard at the left, two lavender pillows, dark muted purple comforter with a folded cream throw and a book near the foot. Beds independently isolated in each cell, all roughly horizontal silhouettes. Warm natural materials and cozy lived-in details.
- **Workstations and wardrobe**. TOP LEFT a real compact walnut laptop desk with side drawers on right, open graphite laptop just right of center seen three-quarter open screen facing slightly left, blue-grey lit screen, stacked two notebooks and small mug, power cable tucked down leg. TOP RIGHT a walnut PC workstation with a glowing pixel-art editor on widescreen monitor at far right, small dark tower beneath at far right, compact mechanical keyboard near LEFT edge of the desktop so a person sitting to the left can reach it with hands stretched right, small mouse and coaster, open space below desktop on left for legs, keyboard and wood surface should be on the front edge to be visible at sprite scale. BOTTOM LEFT a walnut makeup vanity table with integrated upright oval mirror framed in wood and small warm bulbs, drawers on right and cream top with a few jars, brush cup and perfume atomizer. BOTTOM RIGHT a closed tall wood wardrobe with visible inset panels, two brass handles, drawers below and folded soft light blue clothing visible on a nearby low cubby on its right. Each furniture piece completely isolated and has its own distinct silhouette, no connected pieces between cells.

## Senny’s side-view workstation

Built-in ImageGen used the previous desk sprite and a local game capture with Senny at the desk. The monitor and tower face left toward him. Sprite Cast PixelKit packed the [workstation](../../game/assets/home/pixel-pc-desk.png) into its 71 × 44 pixel footprint.

> Edit the first attached pixel-art workstation sprite for Tokyo’s Journey. The second image shows its placement next to Senny, who sits on the left facing right. Return ONLY an isolated complete desk-and-PC sprite on genuinely transparent RGBA, no character, floor, wall, furniture beside the desk, shadows, labels, or padding artifacts. Keep the same walnut desk, approximate desk width and height, support legs, warm dark outlines and crisp chunky 16-bit pixel style. Correct the equipment to match the SIDE VIEW in this platformer. At the right half of the table, show a thin upright desktop LCD monitor almost edge-on in its literal side profile, with its screen turned LEFT toward Senny, away from the camera. The screen should be a narrow cyan-lit strip on the LEFT edge of its charcoal profile, never a broad panel facing the viewer. Show the side of the monitor housing extending to the right, with a clear upright neck and flat stable foot beneath it. Show a separate compact PC tower under the desk at the far right, primarily its dark side panel, with just a sliver of left-facing front panel, vent and blue power indicator. At the extreme left of the tabletop, put the same keyboard as a thin LOW horizontal slab shown mostly edge-on and flush with the surface, with restrained small highlights where keys catch the light. A small mouse sits just to its right. The keyboard begins near the front-left edge of the game sprite so Senny's existing outstretched hands align with it. Keep the entire horizontal desktop and legs visible, with tabletop at roughly 56 percent of the full sprite height. Tender warm upper-left lighting, connected flat color clusters, nearest-neighbor hard pixel edges. The footprint is about 1.6 times as wide as the sprite is tall. Preserve padding around every part.

The input-device revision used the same desk and Senny’s typing pose as references. PixelKit sized the keyboard to 14 × 4 pixels and the mouse to 8 × 4 before they were placed on the tabletop.

> Draw two isolated side-view pixel-art props on transparency. Show the dark mechanical keyboard from its short end, with its low wrist edge facing Senny at screen left and the key rows receding into the scene. Show the mouse from the side with the palm hump at left and the tapered button end pointing right toward the monitor. Match the desk’s warm outlines and use sparse cream and brown highlights.

The tabletop was later cleared between the keyboard and coaster. ImageGen removed the mouse using the workstation sprite as reference. PixelKit resized the edited area to the existing sprite grid and matched it to the surrounding wood palette.

### Desk rotation

The [current sprite](../../game/assets/home/pixel-pc-desk.png) uses a 32 × 44 grid. ImageGen used the in-game capture for the palette and hand position and a mirrored [ZEISS side-view workstation photograph](https://www.zeiss.de/vision-care/newsroom/news/2017/zeiss-officelens-brillenglaeser-fuer-stressfreieres-sehen-im-buero.html) for the monitor, stand, and keyboard geometry. Sprite Cast PixelKit sized the export and set the desktop at the height of Senny’s hands.

> Draw the compact walnut desk from its short end, with the long edge extending into the scene. Leave the left underside open for Senny’s knees. Put the keyboard at the left lip, the slightly tilted left-facing monitor on an angled stand just beyond it, and the charcoal tower under the monitor. Keep the mouse off the desktop. Match the Level 0 outlines and wood palette.

### Reshu’s side-view vanity

The [vanity sprite](../../game/assets/home/pixel-vanity.png) uses a 26 × 46 grid. ImageGen used the game capture for the walnut finish and seated pose and a [makeup salon photo](https://mycolor-salon.com/) for the angled tabletop mirror and placement of the cosmetics. Sprite Cast PixelKit sized and quantized the export.

> Show the short end of the walnut dressing table at seated hand height. Put a rose blush compact and capped perfume bottle at the near edge, with a slim oval mirror on a brass swivel stand just beyond them. Turn the reflective face toward Reshu at screen left and keep the small warm bulbs from the original vanity. Leave room beneath the tabletop for her knees.

### Sushil’s keyboard and PC

ImageGen used Sushil’s bedroom and Senny’s side-view desk as references. Sprite Cast PixelKit split and sized the [musical keyboard](../../game/assets/home/pixel-music-keyboard.png) to 41 × 25 pixels and the [PC desk](../../game/assets/home/pixel-sushil-pc-desk.png) to 32 × 44.

> Draw a charcoal and sage electronic piano with ivory keys, a row of raised black keys, and a black folding X stand. Draw a separate short-end view of a walnut desk with a thin left-facing monitor, a typing keyboard close to its stand, and a green-gray tower under the right side. Use the bedroom's warm outlines and leave both sprites isolated on transparency.
