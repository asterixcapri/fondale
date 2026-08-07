import { Container, Graphics } from "pixi.js";

import type { Polygon, Room } from "./room";

/**
 * Draws a room's invisible data back over the painting it was read from.
 *
 * This is how scene setup gets checked without a human: the walkable area,
 * masks and hotspots are numbers typed against a grid, and the only way to
 * know they landed on the cobbles rather than the wall is to see them on top
 * of the art. Rendered from the same objects the game plays with, so it cannot
 * drift out of agreement with what actually runs.
 */

const WALKABLE = 0x3ad46b;
const FOREGROUND = 0xff8c1a;
const HOTSPOT = 0x35a7ff;
const EXIT = 0xff4fd8;

function drawPolygon(g: Graphics, shape: Polygon, colour: number, alpha: number): void {
  const flat = shape.flatMap(({ x, y }) => [x, y]);
  g.poly(flat).fill({ color: colour, alpha }).stroke({ color: colour, width: 1, alpha: 0.9 });
}

export function buildDebugOverlay(room: Room): Container {
  const layer = new Container();
  layer.label = "debug-overlay";

  const g = new Graphics();

  for (const polygon of room.walkable) drawPolygon(g, polygon, WALKABLE, 0.25);
  for (const mask of room.foreground) drawPolygon(g, mask.shape, FOREGROUND, 0.25);
  for (const hotspot of room.hotspots) drawPolygon(g, hotspot.shape, HOTSPOT, 0.2);
  for (const exit of room.exits) drawPolygon(g, exit.shape, EXIT, 0.2);

  // Baselines mark where an object meets the ground, which is what decides
  // whether the character is in front of it or behind.
  for (const mask of room.foreground) {
    const xs = mask.shape.map((p) => p.x);
    g.moveTo(Math.min(...xs), mask.baseline)
      .lineTo(Math.max(...xs), mask.baseline)
      .stroke({ color: FOREGROUND, width: 1 });
  }

  layer.addChild(g);
  return layer;
}
