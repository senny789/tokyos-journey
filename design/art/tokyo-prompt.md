# Tokyo sprite direction

Generated with the built-in image generator, without Phaser's sprite service.

Tokyo is a female golden retriever, she/her. Natural four-legged dog, warm honey-gold coat, cream muzzle and chest, floppy ears, black nose and dark eyes, fluffy tail. No clothing or accessories. Crisp SNES-era 16-bit pixel art with a dark brown outline and transparent background.

Production prompt: Create a sprite sheet with exactly eight equal columns and six equal rows. Keep Tokyo side-on and facing right, with the same identity, scale and proportions throughout. Row 1 is an eight-frame idle loop. Row 2 is an eight-frame walk. Row 3 is an eight-frame galloping run. Row 4 is takeoff, rising, apex, falling and landing poses. Row 5 is a low crouch loop. Row 6 is sitting down, seated idle and standing up. Use consistent foot baselines, generous clear margins and no text, grid, scenery or watermark.

`tokyo-source.png` preserves the generated original. `scripts/prepare-sprites.ps1` slices and samples that sheet into the runtime atlas at 64 pixels per frame with a shared foot baseline and binary alpha. The atlas is `game/assets/tokyo.png`.

## Lower crouch revision

This resting-only revision is retained as a source reference. The active posture/crawl animation and full prompt are documented in `tokyo-crawl-prompt.md`.

Built-in image generation edited Tokyo's pose using the runtime atlas as the character reference. Replacement sheet: `tokyo-crouch-source.png`, four columns by two rows. Prompt: keep Tokyo's golden retriever identity and 16-bit style; lower her chin and lower muzzle to the ground in every frame, tuck her legs underneath her, lower her chest and belly, keep her eyes alert and her tail low; tiny breathing and tail motion only. No raised head, straight legs, scenery, text or shadow. Transparent background. The build script fits these eight poses into row five only, at the existing scale and foot baseline.
