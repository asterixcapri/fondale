#!/usr/bin/env python3
"""Audit structural invariants of a horizontal RGBA walk strip.

This deliberately does not judge gait semantics. It reports geometry and alpha
problems that must be fixed before the visual motion gates are applied.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from statistics import mean
import subprocess


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("strip", type=Path)
    parser.add_argument("--cell-width", type=int, required=True)
    parser.add_argument("--cell-height", type=int, required=True)
    parser.add_argument("--expected-frames", type=int, default=8)
    parser.add_argument("--height-drift", type=float, default=0.08)
    parser.add_argument("--centroid-jitter", type=float, default=0.08)
    parser.add_argument("--report", type=Path)
    return parser.parse_args()


def identify_size(path: Path) -> tuple[int, int]:
    result = subprocess.run(
        ["magick", "identify", "-format", "%w %h", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    width, height = result.stdout.split()
    return int(width), int(height)


def read_frame_rgba(
    path: Path, index: int, cell_width: int, cell_height: int
) -> bytes:
    result = subprocess.run(
        [
            "magick",
            str(path),
            "-crop",
            f"{cell_width}x{cell_height}+{index * cell_width}+0",
            "+repage",
            "rgba:-",
        ],
        check=True,
        capture_output=True,
    )
    return result.stdout


def alpha_metrics(
    rgba: bytes, frame_width: int, frame_height: int
) -> dict[str, object]:
    visible = []
    for pixel_index in range(frame_width * frame_height):
        alpha = rgba[pixel_index * 4 + 3]
        if alpha:
            visible.append((pixel_index % frame_width, pixel_index // frame_width, alpha))

    if not visible:
        return {"empty": True}

    left = min(pixel[0] for pixel in visible)
    top = min(pixel[1] for pixel in visible)
    right = max(pixel[0] for pixel in visible) + 1
    bottom = max(pixel[1] for pixel in visible) + 1
    total_alpha = sum(pixel[2] for pixel in visible)
    weighted_x = sum(pixel[0] * pixel[2] for pixel in visible)
    weighted_y = sum(pixel[1] * pixel[2] for pixel in visible)
    touches_non_ground_border = any(
        x in (0, frame_width - 1) or y == 0
        for x, y, _ in visible
    )

    return {
        "empty": False,
        "bbox": [left, top, right, bottom],
        "visible_width": right - left,
        "visible_height": bottom - top,
        "alpha_centroid": [
            round(weighted_x / total_alpha, 2),
            round(weighted_y / total_alpha, 2),
        ],
        "touches_non_ground_border": touches_non_ground_border,
    }


def main() -> int:
    args = parse_args()
    image_width, image_height = identify_size(args.strip)
    errors: list[str] = []
    warnings: list[str] = []

    if image_height != args.cell_height:
        errors.append(
            f"strip height {image_height} does not equal cell height {args.cell_height}"
        )
    if image_width % args.cell_width:
        errors.append(
            f"strip width {image_width} is not divisible by cell width {args.cell_width}"
        )

    frame_count = image_width // args.cell_width
    if frame_count != args.expected_frames:
        errors.append(
            f"found {frame_count} frames; expected {args.expected_frames}"
        )

    frames = []
    for index in range(frame_count):
        rgba = read_frame_rgba(
            args.strip, index, args.cell_width, args.cell_height
        )
        metrics = alpha_metrics(rgba, args.cell_width, args.cell_height)
        metrics["content_hash"] = hashlib.sha256(rgba).hexdigest()[:12]
        metrics["index"] = index
        frames.append(metrics)
        if metrics["empty"]:
            errors.append(f"frame {index} is empty")
        elif metrics["touches_non_ground_border"]:
            warnings.append(f"frame {index} touches a top or lateral cell border")

    duplicate_groups: dict[str, list[int]] = {}
    for frame in frames:
        duplicate_groups.setdefault(str(frame["content_hash"]), []).append(
            int(frame["index"])
        )
    duplicates = [indexes for indexes in duplicate_groups.values() if len(indexes) > 1]
    if duplicates:
        errors.append(
            "walk cycle contains exact duplicate frames: "
            + "; ".join(", ".join(map(str, indexes)) for indexes in duplicates)
        )

    populated = [frame for frame in frames if not frame["empty"]]
    if populated:
        heights = [int(frame["visible_height"]) for frame in populated]
        average_height = mean(heights)
        height_span = max(heights) - min(heights)
        if average_height and height_span / average_height > args.height_drift:
            warnings.append(
                "visible-height span exceeds threshold: "
                f"{height_span / average_height:.1%} > {args.height_drift:.1%}"
            )

        centroids_x = [float(frame["alpha_centroid"][0]) for frame in populated]
        centroid_span = max(centroids_x) - min(centroids_x)
        if centroid_span / args.cell_width > args.centroid_jitter:
            warnings.append(
                "alpha-centroid x span exceeds threshold: "
                f"{centroid_span / args.cell_width:.1%} > {args.centroid_jitter:.1%}; "
                "inspect pelvis registration"
            )

    report = {
        "strip": str(args.strip),
        "cell": [args.cell_width, args.cell_height],
        "frame_count": frame_count,
        "frames": frames,
        "errors": errors,
        "warnings": warnings,
        "note": "This audit cannot approve gait phases, foot planting, or loop quality.",
    }
    rendered = json.dumps(report, indent=2)
    if args.report:
        args.report.write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
