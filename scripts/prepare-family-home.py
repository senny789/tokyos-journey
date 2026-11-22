"""Pack the Level 0 character poses and pixel furniture via Sprite Cast PixelKit."""

import argparse
from pathlib import Path
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "node_modules/.spritecast-py"))
sys.path.insert(0, str(ROOT / "node_modules/.spritecast/skills/spritecast/scripts"))
import pixelkit

FRAME = 112
BASE_POSES = 8
GROUND = 104
CENTER = 56
ALPHA_EDGE = 128
SOURCES = {
    "sandesh": "exec-8878598a-1bce-4d83-bae3-a3924db46690.png",
    "sushil": "exec-df822176-4135-44c9-94a0-325489db2b93.png",
    "reshika": "exec-c20f71f9-1b15-48e2-a2d0-52d8d3c5f94c.png",
    "senny": "exec-d0b4e0ad-7b41-4bce-a6e3-8857b1579a3e.png",
    "dad": "exec-aaa923e0-88ee-4a97-ab1a-b7799c870750.png",
    "mom": "exec-4722c837-31fa-4f0f-90cd-1b83e42751f9.png",
}
MOTION_SOURCES = {
    "sandesh": "exec-e74c2aaa-9b25-4e50-bb17-8672bd85b5da.png",
    "sushil": "exec-25e07350-bd75-4243-b3dd-0381d1c8ba3f.png",
    "reshika": "exec-abf5706c-48ff-4f00-8ece-1ee3f0982f90.png",
    "senny": "exec-5b5610de-3ae4-4a67-b62b-dfbbdc2a98ba.png",
    "dad": "exec-58355e48-c33d-4b79-b87f-4b1f3b027bc9.png",
    "mom": "exec-69f6c5ab-bfe2-4d5c-bab2-ecc519adc417.png",
}
REFERENCE_POSE = {"sushil": 3}
ROOM_PIXEL = 4
FURNITURE = {
    "sofa": (324, "width"), "armchair": (154, "width"), "coffee-table": (136, "width"),
    "lamp-off": (218, "height"), "lamp-on": (218, "height"), "sideboard": (208, "width"),
    "bed": (168, "width"), "rug": (552, "width"), "basket": (75, "width"),
}
PROP_PALETTES = {
    "sandesh": [(122, 98, 70), (175, 147, 99), (224, 202, 153), (249, 235, 199)],
    "dad": [(53, 67, 45), (79, 99, 69), (122, 141, 103), (157, 170, 130)],
    "reshika": [(164, 135, 101), (200, 176, 137), (231, 208, 169), (252, 235, 199)],
}


def cut_poses(sheet, columns):
    poses = []
    for index in range(columns * 2):
        column, row = index % columns, index // columns
        box = (sheet.width * column // columns, sheet.height * row // 2,
               sheet.width * (column + 1) // columns, sheet.height * (row + 1) // 2)
        cell = sheet.crop(box)
        mask = cell.getchannel("A").point(lambda alpha: 255 if alpha >= ALPHA_EDGE else 0)
        bounds = mask.getbbox()
        if bounds is None or bounds == (0, 0, cell.width, cell.height):
            raise ValueError(f"Pose {index} has no usable transparent cutout")
        cell.putalpha(mask)
        poses.append(cell.crop(bounds))
    return poses


def pack_member(name, input_folder, asset_folder, motion):
    base_frames = 14 if motion else BASE_POSES
    base_name = f"{name}-home.png" if motion else f"{name}.png"
    original = Image.open(asset_folder / base_name).convert("RGBA")
    if original.size != (FRAME * base_frames, FRAME):
        raise ValueError(f"{name}: unexpected base strip dimensions {original.size}")
    first_pose = original.crop((0, 0, FRAME, FRAME))
    _, top, _, bottom = first_pose.getchannel("A").getbbox()
    standing_height = bottom - top
    old_pixels = np.asarray(original)
    palette = np.unique(old_pixels[old_pixels[..., 3] >= ALPHA_EDGE, :3], axis=0)
    if name in PROP_PALETTES:
        palette = np.concatenate((palette, np.array(PROP_PALETTES[name], dtype=np.uint8)))

    sources = MOTION_SOURCES if motion else SOURCES
    sheet = Image.open(input_folder / sources[name]).convert("RGBA")
    poses = cut_poses(sheet, 4 if motion else 3)
    reference_frame = 7 if motion else REFERENCE_POSE.get(name, 0)
    pixelkit.FIG = poses[reference_frame].height
    strip = Image.new("RGBA", (FRAME * (base_frames + len(poses)), FRAME))
    strip.paste(original)
    for offset, pose in enumerate(poses):
        rgb, coverage = pixelkit.down(pose, standing_height)
        rgba = np.dstack((np.rint(rgb * 255), (coverage >= 0.5) * 255)).astype(np.uint8)
        image = Image.fromarray(pixelkit.to_palette(rgba, palette))
        image = image.crop(image.getchannel("A").getbbox())

        # Anchor the feet, so an extended hand never shifts the standing position.
        feet = image.getchannel("A").crop((0, image.height - 10, image.width, image.height))
        heel, _, toe, _ = feet.getbbox()
        if motion and offset < 4:
            # Stabilize the torso across contact and passing poses, even when the planted foot changes.
            upper = image.getchannel("A").crop((0, 0, image.width, image.height // 2))
            left, _, right, _ = upper.getbbox()
            anchor = (left + right + heel + toe) // 4
        else:
            anchor = (heel + toe) // 2
        x = CENTER - anchor
        y = GROUND - image.height
        if x < 0 or y < 0 or x + image.width > FRAME:
            raise ValueError(f"{name}: pose {offset} will not fit the {FRAME}px frame")
        strip.paste(image, ((base_frames + offset) * FRAME + x, y))

    suffix = "home-motion" if motion else "home"
    destination = asset_folder / f"{name}-{suffix}.png"
    strip.save(destination, optimize=True)
    print(f"{name}: {base_frames + len(poses)} poses -> {destination.name}")


def pack_furniture(asset_folder):
    for name, (screen_size, axis) in FURNITURE.items():
        source = Image.open(asset_folder / f"{name}.png").convert("RGBA")
        pixelkit.FIG = source.height if axis == "height" else source.width
        rgb, coverage = pixelkit.down(source, round(screen_size / ROOM_PIXEL))
        solid = coverage >= 0.5
        colors = pixelkit.palette(rgb[solid], 34, seed=19)
        palette = np.rint(np.clip(pixelkit.lab2rgb(colors), 0, 1) * 255).astype(np.uint8)
        rgba = np.dstack((np.rint(rgb * 255), solid * 255)).astype(np.uint8)
        tile = Image.fromarray(pixelkit.to_palette(rgba, palette))
        # Keep the existing sprite dimensions and alpha alignment for prop placement.
        tile.resize(source.size, Image.Resampling.NEAREST).save(asset_folder / f"pixel-{name}.png", optimize=True)
        print(f"{name}: {tile.width} × {tile.height} art pixels")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_folder", type=Path, help="Folder containing the ImageGen source sheets")
    parser.add_argument("--motion", action="store_true", help="Append the walk and sofa poses and pack pixel furniture")
    args = parser.parse_args()
    for name in SOURCES:
        pack_member(name, args.input_folder, ROOT / "game/assets/family", args.motion)
    if args.motion:
        pack_furniture(ROOT / "game/assets/home")


if __name__ == "__main__":
    main()
