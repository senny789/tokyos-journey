# Sprite style guide

Use this guide for the production workflow for every new or revised sprite in Tokyo's Journey. Follow the [graphic style reference](graphic-style.md) for perspective, pixels, lighting, materials, and palettes.

## Visual references

- Use the [family motion sheets](../../game/assets/family/) for character outlines, proportions, and shading. Start with the matching character's existing sheet when adding a pose.
- Use [Tokyo's motion atlas](../../game/assets/tokyo-family.png) and [crawl atlas](../../game/assets/tokyo-family-crouch.png) for her silhouette, honey and cream fur, and charcoal brown outline. Keep her floppy ears, feathered tail, and natural four-legged proportions recognizable.
- Use the [Level 0 sofa](../../game/assets/home/pixel-sofa.png) and [room painter](../../game/homeInterior.ts) for the environment's pixel size, warm wood, and soft indoor light. Match the accepted art for the destination scene when its lighting or palette differs.

## Match the art in the scene

- Draw crisp 16-bit side-view pixel art with square pixels, outlines in the material’s shadow colors, and connected clusters of flat color. Use a few shades per material and sparse highlights. Keep contours and interior features readable against the destination background.
- Match the camera, light direction, and apparent pixel size of neighboring sprites at their actual display scale. In Level 0, Tokyo and the family use roughly 2.3–2.6 screen units per art pixel. The room and furniture use roughly four. Use nearest-neighbor sampling for crisp edges.
- Keep transparent padding around the full silhouette. Put ground shadows, scenery, and interface text on separate layers. Inspect the exported alpha on both light and dark backgrounds to catch fringes and stray pixels.

## Build animation sheets

1. Inspect the current sheet and the character in the destination scene. Pull identity, costume, proportions, and colors from that sheet. Use photos as likeness references when the person supplies them.
2. Draw the new poses with ImageGen using the current sheet as reference. Use Sprite Cast PixelKit to size, quantize, and pack them. Start from the existing [family](family-sprites.md) or [Tokyo](tokyo-prompt.md) process. Draw one complete pose per frame with the same perspective, silhouette scale, and palette throughout a clip.
3. Match the existing frame grid and anchors. Level 0 family frames are 112 × 112, facing right, with feet aligned at (56, 104). Tokyo's current frames are 52 × 52. Preserve the base sheet's anchor when extending it and mirror the art in-game for the opposite facing where appropriate. Align seated poses to the actual cushion and carried items to the hand or mouth.
4. Save the exported PNG in the game assets, register it with the correct frame dimensions, and wire the new frames to their gameplay state. Preserve any frame indices that other states or scenes already use. Record the reference and prompt in the corresponding art note.
5. Build for local testing and view the sprite beside its neighbors at the in-game scale. Look at the whole animation and transitions so the feet or contact point stay in place and the size, outline, colors, and lighting stay consistent. Show a frame captured from the local game or exported from the loaded atlas. Label any concept art as a reference.
