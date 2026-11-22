"""Pack Tokyo's ImageGen pose sources into the game's Sprite Cast PixelKit atlases."""

import argparse
from pathlib import Path
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

FRAME = 52
COLUMNS = 8
FOOT_LINE = 47
CENTER_X = 27
PALETTE_SIZE = 20
ALPHA_CUT = 218
STANDING_WIDTH = 47
CRAWL_HEIGHT = 15
TAIL_SWAY = (0, -1, -2, -1, 0, 1, 2, 1)


def isolate_pose(cell):
    from scipy.ndimage import label

    pixels = np.array(cell)
    labels, count = label(pixels[..., 3] >= ALPHA_CUT, structure=np.ones((3, 3)))
    if not count:
        raise ValueError("Empty sprite cell")
    largest = np.argmax(np.bincount(labels.ravel())[1:]) + 1
    solid = labels == largest
    pixels[..., 3] = solid.astype(np.uint8) * 255
    pose = Image.fromarray(pixels)
    return pose.crop(pose.getbbox())


def extract_poses(path, columns, rows):
    sheet = Image.open(path).convert("RGBA")
    for row in range(rows):
        for col in range(columns):
            yield isolate_pose(sheet.crop((
                col * sheet.width // columns, row * sheet.height // rows,
                (col + 1) * sheet.width // columns, (row + 1) * sheet.height // rows,
            )))


def render_pose(pose, width, palette, pixelkit, max_height=38):
    pixelkit.FIG = pose.width
    rgb, coverage = pixelkit.down(pose, width)
    if coverage.shape[0] > max_height:
        # Keep the crouch silhouette within the tunnel's existing clearance.
        premultiplied = rgb * coverage[..., None]
        rgb = np.stack([
            np.asarray(Image.fromarray(channel).resize((width, max_height), Image.Resampling.BOX))
            for channel in np.moveaxis(premultiplied, -1, 0)
        ], axis=-1)
        coverage = np.asarray(Image.fromarray(coverage).resize((width, max_height), Image.Resampling.BOX))
        rgb = np.clip(rgb / np.maximum(coverage[..., None], 1e-4), 0, 1)
    indices = pixelkit.snap(rgb, pixelkit.lab(palette / 255.0), palette)
    alpha = np.uint8(coverage >= 0.45) * 255
    colors = np.where(alpha[..., None] == 0, 0, palette[indices])
    cutout = Image.fromarray(np.dstack((colors, alpha)))
    frame = Image.new("RGBA", (FRAME, FRAME))
    frame.paste(cutout, (CENTER_X - width // 2, FOOT_LINE - cutout.height))
    return frame


def sway_tail(frame, rise):
    # The reference is the exact neutral pose. Move only the free end of the tail in idle.
    pose = Image.new("RGBA", frame.size)
    tail_tip, tail_root = 4, 16
    for x in range(FRAME):
        weight = np.clip((tail_root - x) / (tail_root - tail_tip), 0, 1)
        column = frame.crop((x, 0, x + 1, FRAME))
        pose.paste(column, (x, -round(rise * weight)))
    return pose


def write_atlas(poses, destination):
    sheet = Image.new("RGBA", (COLUMNS * FRAME, len(poses) // COLUMNS * FRAME))
    for index, pose in enumerate(poses):
        sheet.paste(pose, (index % COLUMNS * FRAME, index // COLUMNS * FRAME))
    sheet.save(destination, optimize=True)
    print(f"{destination.name}: {len(poses)} poses at {FRAME}x{FRAME}")


def apply_pose_revision(motion_frames, crawl_frames, source_path, use_revised_crawl):
    revision = Image.open(source_path).convert("RGBA")
    if revision.size != (COLUMNS * FRAME, 3 * FRAME):
        raise ValueError("Tokyo's pose revision needs three rows of eight 52 × 52 poses")
    frames = [
        revision.crop((x, y, x + FRAME, y + FRAME))
        for y in range(0, revision.height, FRAME)
        for x in range(0, revision.width, FRAME)
    ]
    # Use the exact standing pose at the end of the accepted sit transition.
    neutral = motion_frames[47]
    motion_frames[:COLUMNS] = [sway_tail(neutral, rise) for rise in TAIL_SWAY]
    if use_revised_crawl:
        crawl_frames = frames[:2 * COLUMNS]
        crawl_frames[0] = neutral
    eating = frames[2 * COLUMNS:]
    eating[0] = eating[-1] = neutral
    return motion_frames + eating, crawl_frames


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=ROOT)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--motion-source", type=Path)
    parser.add_argument("--crawl-source", type=Path)
    args = parser.parse_args()
    art = args.project / "design/art"
    output = args.output or args.project / "game/assets"
    sys.path.insert(0, str(args.project / "node_modules/.spritecast-py"))
    sys.path.insert(0, str(args.project / "node_modules/.spritecast/skills/spritecast/scripts"))
    import pixelkit

    reference = next(extract_poses(art / "tokyo-family-style-guide.png", 1, 1))
    pixels = np.asarray(reference)
    swatches = pixelkit.palette(pixels[pixels[..., 3] == 255, :3] / 255.0, PALETTE_SIZE, seed=23)
    palette = np.uint8(np.rint(np.clip(pixelkit.lab2rgb(swatches), 0, 1) * 255))
    neutral = render_pose(reference, STANDING_WIDTH, palette, pixelkit)

    motion = list(extract_poses(args.motion_source or art / "tokyo-family-motion-source.png", 8, 6))
    motion_scale = STANDING_WIDTH / motion[0].width
    motion_frames = [sway_tail(neutral, rise) for rise in TAIL_SWAY]
    for index, pose in enumerate(motion[8:], start=8):
        width = min(48, round(pose.width * motion_scale))
        height = CRAWL_HEIGHT if 32 <= index < 40 else 38
        motion_frames.append(render_pose(pose, width, palette, pixelkit, height))

    crawl = list(extract_poses(args.crawl_source or art / "tokyo-family-crawl-source.png", 4, 4))
    crawl_scale = STANDING_WIDTH / crawl[0].width
    crawl_frames = [neutral]
    for index, pose in enumerate(crawl[1:], start=1):
        width = min(47, round(pose.width * crawl_scale))
        height = (29, 27, 24, 22, 19, 17)[index - 1] if index < 7 else CRAWL_HEIGHT
        crawl_frames.append(render_pose(pose, width, palette, pixelkit, height))

    motion_frames, crawl_frames = apply_pose_revision(
        motion_frames, crawl_frames, art / "tokyo-pose-revision.png", args.crawl_source is None,
    )
    write_atlas(motion_frames, output / "tokyo-family.png")
    write_atlas(crawl_frames, output / "tokyo-family-crouch.png")


if __name__ == "__main__":
    main()
