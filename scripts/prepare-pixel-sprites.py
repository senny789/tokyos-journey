"""Pack home, park, and dream art at the pixel sizes used by the game."""

import argparse
from pathlib import Path
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
HOME_PROPS = {
    "ball": (11, 9), "plushie": (19, 15), "bowl-full": (24, 16),
    "bowl-empty": (24, 16), "light-switch": (9, 12),
}
# Number of frames, pixels per full cell, and colors per frame.
PARK_STRIPS = {
    "houses": (4, 108, 32), "boxes": (6, 40, 22), "people": (4, 52, 28),
    "rocks": (7, 66, 24), "portal": (4, 49, 26), "villain-dogs": (8, 46, 22),
    "beds": (4, 55, 22), "food": (6, 26, 20),
}


def load(path):
    return Image.open(path).convert("RGBA")


def sample(sprite, width, colors, pixelkit, cut=0.48):
    pixelkit.FIG = sprite.width
    rgb, coverage = pixelkit.down(sprite, width)
    solid = coverage >= cut
    if not solid.any():
        raise ValueError("The sprite did not survive sampling")
    unique = np.unique(np.rint(rgb[solid] * 255).astype(np.uint8), axis=0)
    swatches = pixelkit.palette(rgb[solid], min(colors, len(unique)), seed=19)
    palette = np.uint8(np.rint(np.clip(pixelkit.lab2rgb(swatches), 0, 1) * 255))
    pixels = np.dstack((np.rint(rgb * 255), solid * 255)).astype(np.uint8)
    pixels[~solid] = 0
    return Image.fromarray(pixelkit.to_palette(pixels, palette))


def cell(sheet, column, row, columns, rows):
    return sheet.crop((
        column * sheet.width // columns, row * sheet.height // rows,
        (column + 1) * sheet.width // columns, (row + 1) * sheet.height // rows,
    ))


def regrid_strip(source, destination, frames, width, colors, pixelkit):
    sheet = Image.new("RGBA", source.size)
    cell_width = source.width // frames
    for index in range(frames):
        artwork = cell(source, index, 0, frames, 1)
        bounds = artwork.getbbox()
        if bounds is None:
            raise ValueError(f"{destination}: empty frame {index}")
        left, top, right, bottom = bounds
        sampled = sample(artwork.crop(bounds), max(2, round(width * (right - left) / cell_width)), colors, pixelkit)
        # Restore the authored bounds and baseline so existing hitboxes and sprite anchors still align.
        sampled = sampled.crop(sampled.getbbox()).resize((right - left, bottom - top), Image.Resampling.NEAREST)
        sheet.paste(sampled, (index * cell_width + left, top))
    sheet.save(destination, optimize=True)


def creature(sheet, column, row):
    from scipy.ndimage import label

    pixels = np.array(cell(sheet, column, row, 4, 2))
    labels, count = label(pixels[..., 3] >= 218, structure=np.ones((3, 3)))
    if not count:
        raise ValueError(f"Empty creature sprite at ({column}, {row})")
    main = np.argmax(np.bincount(labels.ravel())[1:]) + 1
    pixels[..., 3] = np.uint8(labels == main) * 255
    sprite = Image.fromarray(pixels)
    return sprite.crop(sprite.getbbox())


def pack_creatures(source, output, pixelkit):
    # Shared scale and foot line per creature. Owl width changes as its wings unfold.
    recipes = {
        "owl": ([(0, 0), (0, 1)], 27, 27, 24, 26),
        "cats": ([(1, 0), (1, 1), (2, 0), (2, 1)], 27, 24, 24, 23),
        "shadow": ([(3, 0), (3, 1)], 48, 36, 43, 32),
    }
    for name, (order, width, height, body_width, baseline) in recipes.items():
        poses = [creature(source, col, row) for col, row in order]
        scale = body_width / max(pose.width for pose in poses)
        strip = Image.new("RGBA", (width * len(poses), height))
        for index, pose in enumerate(poses):
            sampled = sample(pose, round(pose.width * scale), 18, pixelkit, cut=0.42)
            strip.paste(sampled, (index * width + (width - sampled.width) // 2, baseline - sampled.height))
        strip.save(output / f"{name}-sprites.png", optimize=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=ROOT)
    parser.add_argument("--output", type=Path, help="Asset output directory")
    parser.add_argument("--creatures", type=Path, help="Four-column ImageGen source")
    args = parser.parse_args()
    sys.path.insert(0, str(args.project / "node_modules/.spritecast-py"))
    sys.path.insert(0, str(args.project / "node_modules/.spritecast/skills/spritecast/scripts"))
    import pixelkit

    assets = args.project / "game/assets"
    output = args.output or assets
    for subfolder in ("home", "dream"):
        (output / subfolder).mkdir(parents=True, exist_ok=True)
    for name, (width, colors) in HOME_PROPS.items():
        prop = load(assets / "home" / f"{name}.png")
        sprite = sample(prop, width, colors, pixelkit)
        if name == "plushie":
            # Restore the embroidered face details lost on the 19-pixel grid.
            for stitch in ((7, 4), (11, 4), (9, 6)):
                sprite.putpixel(stitch, (81, 45, 32, 255))
        sprite.save(output / "home" / f"pixel-{name}.png", optimize=True)
    for name, (frames, width, colors) in PARK_STRIPS.items():
        strip = f"park-{name}"
        regrid_strip(load(assets / f"{strip}.png"), output / f"{strip}-pixel.png", frames, width, colors, pixelkit)
    path = args.creatures or args.project / "design/art/dream-creatures-source.png"
    pack_creatures(load(path), output / "dream", pixelkit)


if __name__ == "__main__":
    main()
