"""Fit carry artwork to Tokyo's existing mouth and foot anchors."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "game/assets"
FRAME = 52
COLUMNS = 8
FEET = 47
WIDTH, HEIGHT = 92, 68
ORIGIN = ((WIDTH - FRAME) // 2, (HEIGHT - FRAME) // 2)
PLUSHIE_EAR = (4, 1)
TOY_SWAY = (4, 9, 13, 9, 4, 0, -4, 0)


def atlas_frames(filename):
    atlas = Image.open(ASSETS / filename).convert("RGBA")
    return [
        atlas.crop((x, y, x + FRAME, y + FRAME))
        for y in range(0, atlas.height, FRAME)
        for x in range(0, atlas.width, FRAME)
    ]


def grip(frame):
    alpha = frame.getchannel("A")
    _, _, right, _ = alpha.getbbox()
    # At the tip of the right-facing silhouette, the upper group is the nose.
    nose_y = next(y for y in range(FRAME) if alpha.getpixel((right - 1, y)))
    return ORIGIN[0] + right - 4, ORIGIN[1] + min(FEET - 4, nose_y + 5)


def hanging_plushie(plushie, bite, sway):
    layer = Image.new("RGBA", (WIDTH, HEIGHT))
    layer.paste(plushie, (bite[0] - PLUSHIE_EAR[0], bite[1] - PLUSHIE_EAR[1]))
    # Tilt the body around the gripped ear when her muzzle gets close to the ground.
    for angle in range(sway, 96, 4):
        held = layer.rotate(angle, resample=Image.Resampling.NEAREST, center=bite)
        if held.getchannel("A").getbbox()[3] <= ORIGIN[1] + FEET:
            return held
    raise ValueError(f"Plushie cannot clear Tokyo's foot line at {bite}")


def carry_frame(dog, toy, phase, plushie):
    bite = grip(dog)
    frame = Image.new("RGBA", (WIDTH, HEIGHT))
    frame.paste(dog, ORIGIN)
    if plushie:
        frame.alpha_composite(hanging_plushie(toy, bite, TOY_SWAY[phase % COLUMNS]))
    else:
        left = bite[0] + 3 - toy.width // 2
        top = min(bite[1] - 3, ORIGIN[1] + FEET - toy.height)
        frame.alpha_composite(toy, (left, top))
    # Keep the cream upper muzzle and nose in front of the tucked edge of each toy.
    jaw_x = bite[0] - ORIGIN[0] - 5
    jaw_y = bite[1] - ORIGIN[1]
    frame.alpha_composite(dog.crop((jaw_x, jaw_y - 7, FRAME, jaw_y - 1)),
                          (ORIGIN[0] + jaw_x, ORIGIN[1] + jaw_y - 7))
    return frame


def main():
    poses = atlas_frames("tokyo-family.png") + atlas_frames("tokyo-family-crouch.png")
    toys = {
        "plushie": ROOT / "design/art/tokyo-held-plushie.png",
        "ball": ASSETS / "home/pixel-ball.png",
    }
    for name, path in toys.items():
        toy = Image.open(path).convert("RGBA")
        sheet = Image.new("RGBA", (WIDTH * COLUMNS, HEIGHT * (len(poses) // COLUMNS)))
        for index, dog in enumerate(poses):
            pose = carry_frame(dog, toy, index, name == "plushie")
            sheet.paste(pose, (index % COLUMNS * WIDTH, index // COLUMNS * HEIGHT))
        destination = ASSETS / f"tokyo-carry-{name}.png"
        sheet.save(destination, optimize=True)
        print(f"{destination.name}: {len(poses)} poses at {WIDTH}x{HEIGHT} pixels")


if __name__ == "__main__":
    main()
