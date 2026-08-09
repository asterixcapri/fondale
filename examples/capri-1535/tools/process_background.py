#!/usr/bin/env python3
"""Turn a concept background into a room background the game can load.

The concepts are AI-generated at 1586x992 (16:10) with a painted-on dithering
texture and hundreds of thousands of colours. The game runs at a real low
logical resolution with a limited palette, so each concept is cropped to the
target aspect, downscaled, and quantised.

Cropping takes the excess off the top: these are all golden-hour skies over a
horizon, and sky is the one thing a scene never misses.

Usage:
    tools/process_background.py art/scenes/alley/background.png
    tools/process_background.py --height 180 <src>      # verb-UI variant
"""

import argparse
import sys
from pathlib import Path

from PIL import Image

# The room's logical size. Height is a parameter, not a constant, because the
# verb-UI decision (ticket 04) eats the bottom quarter of the screen if it
# lands on the LucasArts layout — see .scratch/vertical-slice/issues.
DEFAULT_WIDTH = 426
DEFAULT_HEIGHT = 240
DEFAULT_COLOURS = 64

SCENES_DIR = Path("src/scenes")


def process(src: Path, width: int, height: int, colours: int, dither: bool) -> Path:
    im = Image.open(src).convert("RGB")

    # Crop to the target aspect, trimming sky from the top.
    target_aspect = width / height
    src_w, src_h = im.size
    wanted_h = round(src_w / target_aspect)
    if wanted_h > src_h:
        # Source is too tall to satisfy the aspect by trimming height; trim
        # width instead, centred, so nothing important slides out of frame.
        wanted_w = round(src_h * target_aspect)
        left = (src_w - wanted_w) // 2
        im = im.crop((left, 0, left + wanted_w, src_h))
    else:
        im = im.crop((0, src_h - wanted_h, src_w, src_h))

    small = im.resize((width, height), Image.LANCZOS)

    dither_mode = Image.FLOYDSTEINBERG if dither else Image.NONE
    quantised = small.quantize(colors=colours, method=Image.MEDIANCUT, dither=dither_mode)

    out = SCENES_DIR / src.parent.name / "background.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    quantised.convert("RGB").save(out)
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sources", nargs="+", type=Path)
    parser.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument("--colours", type=int, default=DEFAULT_COLOURS)
    parser.add_argument("--dither", action="store_true")
    args = parser.parse_args()

    for src in args.sources:
        if not src.exists():
            print(f"non trovato: {src}", file=sys.stderr)
            return 1
        out = process(src, args.width, args.height, args.colours, args.dither)
        print(f"{src}  ->  {out}  ({args.width}x{args.height}, {args.colours} colori)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
