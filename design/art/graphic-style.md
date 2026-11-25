# Tokyo’s Journey graphic style

Use this reference for every new or revised character, prop, terrain tile, and effect. Start with the approved art for the destination scene and make the new asset look like it belongs beside it. The [sprite workflow](sprite-style.md) covers frame sizes, anchors, processing, and in-game review.

## Visual rules

| Feature | Standard |
| --- | --- |
| Perspective | Orthographic side view. Tokyo and other four-legged animals read in profile. Give furniture and terrain a shallow top facet where it helps describe the surface. |
| Pixels | Crisp 16-bit-style pixel art with square pixels, stepped diagonal edges, and connected blocks of color. Match the visible pixel size of the nearest approved sprite at its in-game size. Use nearest-neighbor scaling and keep the sprite’s proportions. |
| Shape | Read the silhouette first. Use a few large shapes for the body or material, then add small details around important features. Keep outlines in the material’s shadow colors. |
| Lighting | Start with a soft upper-left key light and one shadow direction. Use clusters of flat color for lit planes and shade. Apply the destination scene’s light and color to the whole group of neighboring sprites. |
| Materials | Give repeated materials the same palette, edges, and texture density. Wood uses broad warm planes and sparse grain. Slate uses chipped rims and broad angular fracture planes. Fur uses connected color clusters that follow the body and preserve the approved markings. |
| Transparency | Export transparent PNGs with clear padding around the silhouette. Keep cast shadows and glows on separate layers. Inspect edges against the actual scene and a contrasting solid background. |

## Approved references by asset

- **Tokyo and family** — Match the [Tokyo motion atlas](../../game/assets/tokyo-family.png) and [family sheets](../../game/assets/family/). Preserve silhouette, scale, clothing colors, and identifiable markings between poses. Keep Tokyo’s honey and cream fur, floppy ears, feathered tail, and four-legged proportions.
- **Home** — Match the [sofa](../../game/assets/home/pixel-sofa.png) and [room art](../../game/homeInterior.ts). Use warm wood, subdued upholstery, and soft indoor light. Home characters are roughly 2.3–2.6 screen units per art pixel. Room surfaces and furniture are roughly four.
- **Dream scenes** — Use the palette and light of the destination [dream background](dream-backgrounds.md). Keep gameplay surfaces and interactable props clearly readable against it.

## Level 1 slate

Use the [cliffs](../../game/assets/dream/cliffs.png) and [floating ledges](../../game/assets/dream/floating-ledges.png) together as the material reference. Both use a light blue-gray landing rim, muted violet midtones, and charcoal-blue shade beneath the rock. Floating ledges read as shallow fragments of the cliffs, with chipped shoulders and broken undersides. Apply each section’s existing runtime tint to both families of sprites.

| Use | Shared base swatches |
| --- | --- |
| Deep shade and creases | `#131421` `#191B2B` `#202233` `#27283B` `#2E3045` |
| Fracture planes | `#36384F` `#3D3E56` `#43465F` `#4C5069` `#575A72` |
| Landing rim and highlights | `#62667E` `#6E738B` `#797F95` `#878BA2` `#969AB0` |

Center the visible rim in each frame. Record its pixel row and width in [the asset metadata](../../game/dreamArt.ts) so the visual landing surface lines up with the collider. Scale ledges uniformly to their landing width. Keep the top edge level enough for the player to judge where Tokyo’s paws will land.

## Portals

Use a floating oval formed by interwoven amber and aqua ribbons. The sealed frame shows a muted rim around an empty center. The open frames fill that center with a turquoise swirl and pale gold highlights. Keep the centerline and ground anchor fixed. Use crisp silhouettes with a dark teal edge for daylight contrast and a separate soft glow around the open portal. [Portal atlas and prompt](sprites.md#2-rift-portal)

## Review a sprite in the game

1. Pick an approved neighboring asset as the style reference. Record its path, the palette, and the intended display size before generation.
2. Include the reference in the prompt. Specify the shared perspective, pixel scale, light direction, material, and silhouette. For animation, carry the same references, framing, and pivot through every pose.
3. Reduce and palette-map with Sprite Cast PixelKit. Check the PNG at its native size and over bright and dark backgrounds. Verify frame bounds and keep the physical contact points aligned across poses.
4. Build and capture a local game frame with the new sprite next to its reference. Compare silhouette, pixel size, highlight strength, and shadow color. Play the interaction or animation and check paw contact or collision alignment.
5. Record the prompt and frame metadata in the matching art note so the next sprite can use the same reference.
