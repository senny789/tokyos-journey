from pathlib import Path
import sys
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'node_modules/.spritecast-py'))
sys.path.insert(0, str(ROOT / 'node_modules/.spritecast/skills/spritecast/scripts'))
import pixelkit
SOURCES = {
    'dark': 'exec-9c9529f0-1c48-462f-9820-1ed783692cae.png',
    'kennel': 'exec-9b03b3aa-9a31-47c3-9ca2-52f86c3ed771.png',
    'night-house': 'exec-40171d33-e54c-42c7-8ee1-cc6b8ff9150c.png',
    'forest': 'exec-17011802-416f-401d-ae7a-2bc7ee3f4c43.png',
    'grassland': 'exec-53abd82a-4359-4b99-b361-9040e6f798b8.png',
    'city': 'exec-cf71c306-8c80-4f0e-810b-cea5e379469e.png',
    'toys': 'exec-c894fbfb-6d22-4dc8-a0ec-7472f4e92b28.png',
    'spring': 'exec-3c8e77c2-1642-4b67-8ea6-b3919a05c13d.png',
}
source = Path(sys.argv[1])
dest = ROOT / 'game/assets/dream'
dest.mkdir(parents=True, exist_ok=True)
for name, file in SOURCES.items():
    im = Image.open(source / file).convert('RGBA')
    assert abs(im.width / im.height - 16 / 9) < 0.02, (name, im.size)
    pixelkit.FIG = im.height
    rgb, coverage = pixelkit.down(im, 180)
    rgba = np.dstack([rgb, coverage])
    palette_lab = pixelkit.palette(rgb, 36, seed=19)
    palette_rgb = np.uint8(np.rint(np.clip(pixelkit.lab2rgb(palette_lab), 0, 1) * 255))
    small = pixelkit.to_palette(np.uint8(np.rint(np.clip(rgba * 255, 0, 255))), palette_rgb)
    tile = Image.fromarray(small, 'RGBA').resize((1280, 720), Image.Resampling.NEAREST)
    tile.save(dest / f'{name}.png', optimize=True)
    print(f'{name}: {im.size} -> {tile.size}, {len(palette_rgb)} palette colors')
