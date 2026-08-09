#!/usr/bin/env python3
"""Split, compose, validate, and preview horizontal character sprite strips."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw


def open_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def opaque_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("frame contains no visible pixels")
    return bbox


def remove_corner_background(image: Image.Image, tolerance: int) -> Image.Image:
    if image.getchannel("A").getextrema()[0] < 255:
        return image
    pixels = image.load()
    background = pixels[0, 0][:3]
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, _ = pixels[x, y]
            distance = abs(red - background[0]) + abs(green - background[1]) + abs(
                blue - background[2]
            )
            pixels[x, y] = (red, green, blue, 0 if distance <= tolerance else 255)
    return image


def split_grid(args: argparse.Namespace) -> int:
    image = open_rgba(args.sheet)
    if image.width % args.columns or image.height % args.rows:
        print("sheet dimensions are not divisible by the requested grid", file=sys.stderr)
        return 1
    cell_width = image.width // args.columns
    cell_height = image.height // args.rows
    args.output.mkdir(parents=True, exist_ok=True)
    index = 0
    for row in range(args.rows):
        for column in range(args.columns):
            left = column * cell_width
            top = row * cell_height
            frame = image.crop((left, top, left + cell_width, top + cell_height))
            frame.save(args.output / f"{args.prefix}-{index:03}.png")
            index += 1
    print(
        json.dumps(
            {
                "frames": index,
                "cellWidth": cell_width,
                "cellHeight": cell_height,
                "output": str(args.output),
            }
        )
    )
    return 0


def read_anchors(path: Path | None, count: int) -> list[tuple[float, float]] | None:
    if path is None:
        return None
    raw = json.loads(path.read_text())
    if not isinstance(raw, list) or len(raw) != count:
        raise ValueError(f"anchor file must contain exactly {count} entries")
    anchors: list[tuple[float, float]] = []
    for index, item in enumerate(raw):
        if not isinstance(item, dict) or not isinstance(item.get("x"), (int, float)) or not isinstance(
            item.get("y"), (int, float)
        ):
            raise ValueError(f"anchor {index} must contain numeric x and y")
        anchors.append((float(item["x"]), float(item["y"])))
    return anchors


def compose_strip(args: argparse.Namespace) -> int:
    if not args.frames:
        print("at least one frame is required", file=sys.stderr)
        return 1
    originals = [remove_corner_background(open_rgba(path), args.background_tolerance) for path in args.frames]
    supplied_anchors = read_anchors(args.anchors, len(originals))
    prepared: list[tuple[Image.Image, float, float]] = []
    reference_height: int | None = None

    for index, image in enumerate(originals):
        left, top, right, bottom = opaque_bbox(image)
        if index == args.reference_frame:
            reference_height = bottom - top
        if supplied_anchors is None:
            anchor_x = (left + right) / 2
            anchor_y = bottom
        else:
            anchor_x, anchor_y = supplied_anchors[index]
        cropped = image.crop((left, top, right, bottom))
        prepared.append((cropped, anchor_x - left, anchor_y - top))

    if reference_height is None:
        raise ValueError("reference frame index is outside the supplied frames")
    scale = args.height / reference_height
    scaled: list[tuple[Image.Image, float, float]] = []
    for image, anchor_x, anchor_y in prepared:
        width = max(1, round(image.width * scale))
        height = max(1, round(image.height * scale))
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        scaled.append((resized, anchor_x * scale, anchor_y * scale))

    left_extent = math.ceil(max(anchor_x for _, anchor_x, _ in scaled))
    right_extent = math.ceil(max(image.width - anchor_x for image, anchor_x, _ in scaled))
    top_extent = math.ceil(max(anchor_y for _, _, anchor_y in scaled))
    bottom_extent = math.ceil(max(image.height - anchor_y for image, _, anchor_y in scaled))
    cell_width = left_extent + right_extent
    cell_height = top_extent + bottom_extent
    strip = Image.new("RGBA", (cell_width * len(scaled), cell_height), (0, 0, 0, 0))
    for index, (image, anchor_x, anchor_y) in enumerate(scaled):
        x = index * cell_width + round(left_extent - anchor_x)
        y = round(top_extent - anchor_y)
        strip.alpha_composite(image, (x, y))

    if args.colours > 0:
        alpha = strip.getchannel("A")
        color = strip.convert("RGB").quantize(
            colors=args.colours, method=Image.Quantize.MEDIANCUT
        ).convert("RGB")
        color.putalpha(alpha)
        strip = color

    args.output.parent.mkdir(parents=True, exist_ok=True)
    strip.save(args.output)
    print(
        json.dumps(
            {
                "output": str(args.output),
                "frames": len(scaled),
                "cellWidth": cell_width,
                "cellHeight": cell_height,
                "visualAnchor": {"x": left_extent, "y": top_extent},
                "scale": scale,
                "colours": args.colours,
            }
        )
    )
    return 0


def visible_colours(image: Image.Image) -> int:
    colours: set[tuple[int, int, int]] = set()
    for y in range(image.height):
        for x in range(image.width):
            pixel = image.getpixel((x, y))
            if pixel[3] > 0:
                colours.add(pixel[:3])
    return len(colours)


def validate_strip(args: argparse.Namespace) -> int:
    image = open_rgba(args.strip)
    errors: list[str] = []
    warnings: list[str] = []
    if image.width % args.frames:
        errors.append("strip width is not divisible by frame count")
        cell_width = 0
    else:
        cell_width = image.width // args.frames
    alpha_min, alpha_max = image.getchannel("A").getextrema()
    if alpha_max == 0:
        errors.append("strip contains no visible pixels")
    if alpha_min == 255:
        errors.append("strip contains no transparent pixels")
    colours = visible_colours(image)
    if args.max_colours and colours > args.max_colours:
        errors.append(f"strip uses {colours} visible RGB colours; maximum is {args.max_colours}")

    bboxes: list[tuple[int, int, int, int]] = []
    if cell_width:
        for index in range(args.frames):
            frame = image.crop((index * cell_width, 0, (index + 1) * cell_width, image.height))
            try:
                bbox = opaque_bbox(frame)
                bboxes.append(bbox)
                if bbox[0] == 0 or bbox[2] == cell_width:
                    warnings.append(f"frame {index} touches a horizontal cell edge")
                if bbox[1] == 0:
                    warnings.append(f"frame {index} touches the top cell edge")
            except ValueError:
                errors.append(f"frame {index} contains no visible pixels")

    report = {
        "strip": str(args.strip),
        "frames": args.frames,
        "cellWidth": cell_width,
        "cellHeight": image.height,
        "visibleColours": colours,
        "frameBounds": bboxes,
        "warnings": warnings,
        "errors": errors,
    }
    print(json.dumps(report, indent=2))
    return 1 if errors else 0


def preview_strip(args: argparse.Namespace) -> int:
    image = open_rgba(args.strip)
    if image.width % args.frames:
        print("strip width is not divisible by frame count", file=sys.stderr)
        return 1
    cell_width = image.width // args.frames
    cell_height = image.height
    frames: list[Image.Image] = []
    for index in range(args.frames):
        frame = image.crop((index * cell_width, 0, (index + 1) * cell_width, cell_height))
        canvas = Image.new("RGBA", frame.size, (52, 52, 52, 255))
        draw = ImageDraw.Draw(canvas)
        tile = max(2, cell_width // 8)
        for y in range(0, cell_height, tile):
            for x in range(0, cell_width, tile):
                if (x // tile + y // tile) % 2 == 0:
                    draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill=(76, 76, 76, 255))
        canvas.alpha_composite(frame)
        if args.scale != 1:
            canvas = canvas.resize(
                (cell_width * args.scale, cell_height * args.scale), Image.Resampling.NEAREST
            )
        frames.append(canvas.convert("P", palette=Image.Palette.ADAPTIVE))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    duration = round(1000 / args.fps)
    frames[0].save(
        args.output,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
    )
    print(json.dumps({"output": str(args.output), "frames": args.frames, "fps": args.fps}))
    return 0


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    commands = root.add_subparsers(dest="command", required=True)

    split = commands.add_parser("split", help="split an exact image grid into numbered frames")
    split.add_argument("sheet", type=Path)
    split.add_argument("output", type=Path)
    split.add_argument("--columns", type=int, required=True)
    split.add_argument("--rows", type=int, default=1)
    split.add_argument("--prefix", default="frame")
    split.set_defaults(run=split_grid)

    compose = commands.add_parser("compose", help="compose RGBA frames into an aligned strip")
    compose.add_argument("output", type=Path)
    compose.add_argument("frames", nargs="+", type=Path)
    compose.add_argument("--height", type=int, default=100)
    compose.add_argument("--colours", type=int, default=32)
    compose.add_argument("--reference-frame", type=int, default=0)
    compose.add_argument("--anchors", type=Path)
    compose.add_argument("--background-tolerance", type=int, default=70)
    compose.set_defaults(run=compose_strip)

    validate = commands.add_parser("validate", help="validate a horizontal runtime strip")
    validate.add_argument("strip", type=Path)
    validate.add_argument("--frames", type=int, required=True)
    validate.add_argument("--max-colours", type=int, default=32)
    validate.set_defaults(run=validate_strip)

    preview = commands.add_parser("preview", help="create an animated GIF from a strip")
    preview.add_argument("strip", type=Path)
    preview.add_argument("output", type=Path)
    preview.add_argument("--frames", type=int, required=True)
    preview.add_argument("--fps", type=float, required=True)
    preview.add_argument("--scale", type=int, default=1)
    preview.set_defaults(run=preview_strip)

    return root


def main() -> int:
    args = parser().parse_args()
    try:
        return args.run(args)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
