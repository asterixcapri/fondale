#!/usr/bin/env python3
"""Turn a concept walk-cycle sheet into a game-ready sprite strip.

The concept sheets come at whatever size the generator produced, on whatever
ground colour, with the figures at inconsistent positions in their cells. The
engine wants the opposite: every frame the same size, on a transparent ground,
with the character's feet at a known point so a pose swap never makes them
hop.

Frames are keyed off the sheet's own corner pixel, so dark, light and
transparent grounds all work without being told which.

Usage:
    tools/build_sprite.py art/characters/michele/michele-walk-cycle-v4.png michele walk-side
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

CHARACTERS_DIR = Path("src/characters")

# Project-wide native Character height. Scene Perspective Scale may reduce this
# at depth but must not enlarge it. Preserve full RGB colour by default; palette
# reduction is an explicit art-direction choice made with --colours.
NATIVE_HEIGHT = 288
COLOURS = 0


def runs(flags, minimum: int) -> list[tuple[int, int]]:
    spans, start = [], None
    for i, present in enumerate(flags):
        if present and start is None:
            start = i
        elif not present and start is not None:
            if i - start > minimum:
                spans.append((start, i))
            start = None
    if start is not None and len(flags) - start > minimum:
        spans.append((start, len(flags)))
    return spans


def extract(sheet: Path) -> list[Image.Image]:
    source = Image.open(sheet)
    im = source.convert("RGBA")
    pixels = np.asarray(im, dtype=np.int32)
    has_alpha = "A" in source.getbands()
    if has_alpha:
        content = pixels[:, :, 3] > 1
    else:
        ground = np.asarray(source.convert("RGB").getpixel((2, 2)), dtype=np.int32)
        content = np.abs(pixels[:, :, :3] - ground).sum(axis=2) > 60

    frames = []
    for y0, y1 in runs(content.sum(axis=1) > 3, minimum=60):
        for x0, x1 in runs(content[y0:y1].sum(axis=0) > 0, minimum=20):
            block = content[y0:y1, x0:x1]
            ys, xs = np.where(block)
            cut = im.crop((x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1))
            if has_alpha:
                frames.append(cut)
            else:
                cut_pixels = np.asarray(cut, dtype=np.int32)
                alpha = np.where(
                    np.abs(cut_pixels[:, :, :3] - ground).sum(axis=2) > 70, 255, 0
                ).astype(np.uint8)
                frames.append(Image.fromarray(
                    np.dstack([cut_pixels[:, :, :3].astype(np.uint8), alpha]),
                    "RGBA",
                ))
    return frames


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sheet", type=Path)
    parser.add_argument("character")
    parser.add_argument("name")
    parser.add_argument("--height", type=int, default=NATIVE_HEIGHT)
    parser.add_argument(
        "--cell-width",
        type=int,
        help="fixed frame width; useful when several Animations share one Visual Anchor",
    )
    parser.add_argument(
        "--colours",
        type=int,
        default=COLOURS,
        help="palette size; use 0 to preserve full RGB colour",
    )
    args = parser.parse_args()

    frames = extract(args.sheet)
    if not frames:
        print(f"nessun frame trovato in {args.sheet}", file=sys.stderr)
        return 1

    # One scale factor for the whole set, taken from the tallest frame, so a
    # pose with a wider stride does not come out a different height from the
    # rest — which would read as the character bobbing.
    tallest = max(f.height for f in frames)
    factor = args.height / tallest
    scaled = [
        f.resize((max(1, round(f.width * factor)), max(1, round(f.height * factor))), Image.LANCZOS)
        for f in frames
    ]

    widest = max(f.width for f in scaled)
    cell_w = args.cell_width or widest
    if cell_w < widest:
        print(
            f"cell width {cell_w} is narrower than the widest frame ({widest})",
            file=sys.stderr,
        )
        return 1
    cell_h = max(f.height for f in scaled)

    strip = Image.new("RGBA", (cell_w * len(scaled), cell_h), (0, 0, 0, 0))
    for i, frame in enumerate(scaled):
        # Centred horizontally and sat on the floor of the cell: the anchor is
        # the midpoint of the bottom edge, which is where the feet are.
        strip.paste(frame, (i * cell_w + (cell_w - frame.width) // 2, cell_h - frame.height), frame)

    if args.colours > 0:
        # Quantise the colour, not the alpha: a palette pass over RGBA turns soft
        # edges into a fringe, so the alpha is lifted out and put back afterwards.
        alpha = strip.getchannel("A")
        body = strip.convert("RGB").quantize(
            colors=args.colours,
            method=Image.MEDIANCUT,
        ).convert("RGB")
        body.putalpha(alpha)
    else:
        body = strip

    output_dir = CHARACTERS_DIR / args.character
    output_dir.mkdir(parents=True, exist_ok=True)
    png = output_dir / f"{args.name}.png"
    body.save(png)

    colour_description = f"{args.colours} colori" if args.colours > 0 else "colore RGB completo"
    print(f"{png}  ({len(scaled)} frame da {cell_w}x{cell_h}, {colour_description})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
