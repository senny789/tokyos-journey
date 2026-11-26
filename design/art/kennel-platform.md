# Kennel platform

Generated with GPT through sprite-gen from a text description of a side-view 16-bit kennel platform: warm brown timber, dark underside, iron brackets and a flat walkable top. No reference image was sent.

The source is `kennel-platform-generated.png`. Sprite-gen's `slice-sheet` cleaned the alpha and fitted it to a 128 × 48 transparent canvas for the original `kennel-platform.png`.

The current stage uses `kennel-timber-ledge.png`, a 128 × 34 variant with an opaque outline, thicker brackets and a pale continuous landing rim. Sprite-gen applied the warmer palette from `kennel-platform-cut/timber-palette.json`. Its flat rim starts at row 3, x4–123. `kennelTerrain.ts` uses these measurements for the collider placement.

The backgrounds in `kennel-rooms-source.png` came from a single GPT prompt for three muted side-view interiors of a night kennel. The Intake uses amber lamps and stalls, the Feed Loft uses copper light and supplies, and the Drain Room uses blue-gray stone and grates. Each panel was cropped and reduced to a 320 × 138 palette PNG. The floor banks and shafts are drawn from the room layout so each pit lip aligns with the physical edge.
