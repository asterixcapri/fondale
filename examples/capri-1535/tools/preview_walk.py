#!/usr/bin/env python3
"""Play a walk-cycle sheet across a room background, as a GIF.

Ticket 01's real question — does the cycle hold together, or does the head
boil while the legs walk — is a question about motion, and motion is the one
thing the agent cannot look at. So the answer gets rendered as a GIF for a
human to judge, at the size the character actually appears in the game rather
than the size it was drawn at, because most of the wobble washes out in the
downscale.

Frames are found by contrast against the sheet's own corner pixel, so sheets
with a dark, light or transparent ground all work without being told which.

Usage:
    tools/preview_walk.py art/concept/personaggi/michele-walk-cycle-v4.png
    tools/preview_walk.py --height 84 --fps 10 <sheet>
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOM = Path("art/rooms/vicolo-capri.png")
# Where the character walks in the alley, and how big they stand there.
FEET_Y, FROM_X, TO_X = 224, 90, 300
ZOOM = 3


def find_frames(sheet: Path) -> list[Image.Image]:
    im = Image.open(sheet).convert("RGB")
    pixels = np.asarray(im, dtype=np.int32)
    ground = np.asarray(im.getpixel((2, 2)), dtype=np.int32)
    content = np.abs(pixels - ground).sum(axis=2) > 60

    def runs(flags, minimum):
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

    frames = []
    # Rows of figures, ignoring thin bands of caption text and rules.
    for y0, y1 in runs(content.sum(axis=1) > 3, minimum=60):
        for x0, x1 in runs(content[y0:y1].sum(axis=0) > 0, minimum=20):
            block = content[y0:y1, x0:x1]
            ys, xs = np.where(block)
            box = (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)
            cut = im.crop(box)
            alpha = np.where(
                np.abs(np.asarray(cut, dtype=np.int32) - ground).sum(axis=2) > 70, 255, 0
            ).astype(np.uint8)
            frames.append(Image.fromarray(np.dstack([np.asarray(cut, dtype=np.uint8), alpha]), "RGBA"))
    return frames


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sheet", type=Path)
    parser.add_argument("--height", type=int, default=84, help="character height in room pixels")
    parser.add_argument("--fps", type=int, default=10)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    frames = find_frames(args.sheet)
    if not frames:
        print(f"nessun frame trovato in {args.sheet}", file=sys.stderr)
        return 1

    # Scale to the height the character stands at in the scene, keeping the
    # drawn proportions.
    poses = [
        f.resize((max(1, round(f.width * args.height / f.height)), args.height), Image.LANCZOS)
        for f in frames
    ]

    room = Image.open(ROOM).convert("RGB")
    steps = max(len(poses) * 3, 24)
    out_frames = []
    for i in range(steps):
        x = round(FROM_X + (TO_X - FROM_X) * i / steps)
        pose = poses[i % len(poses)]
        frame = room.copy()
        frame.paste(pose, (x - pose.width // 2, FEET_Y - pose.height), pose)
        out_frames.append(frame.resize((room.width * ZOOM, room.height * ZOOM), Image.NEAREST))

    out = args.out or Path(f"test/shots/{args.sheet.stem}.gif")
    out.parent.mkdir(parents=True, exist_ok=True)
    out_frames[0].save(
        out,
        save_all=True,
        append_images=out_frames[1:],
        duration=round(1000 / args.fps),
        loop=0,
        optimize=True,
    )
    print(f"{out}  ({len(frames)} frame trovati, alto {args.height}px, {args.fps} fps)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
