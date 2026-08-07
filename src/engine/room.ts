/**
 * What a room *is*, as data.
 *
 * Rooms are authored as typed modules rather than JSON so that a mistake — a
 * missing entrance, an exit pointing at a room that no longer exists — fails
 * the build instead of the playthrough. Nobody reads the diffs here, so the
 * compiler has to.
 *
 * All coordinates are in room space: 0,0 at the top-left of the background,
 * ROOM_WIDTH x ROOM_HEIGHT at the bottom-right. Nothing in a room definition
 * knows about the window or the scale factor.
 */

/** A point in room space. */
export interface Point {
  x: number;
  y: number;
}

/** A closed polygon. The final vertex joins back to the first implicitly. */
export type Polygon = Point[];

/**
 * How tall the character stands at a given depth.
 *
 * Stops are interpolated linearly by y and sorted back-to-front, which covers
 * both shapes the genre uses: two stops give the classic even ramp (55% at the
 * back wall, 100% at the camera), and extra stops bend it where a scene's
 * perspective is not linear — a stairway, a jetty running out to sea.
 */
export interface ScaleStop {
  /** Room-space y of the character's feet. */
  y: number;
  /** Multiplier applied to the character's native sprite size. */
  scale: number;
}

/**
 * Something in the scene the character passes behind.
 *
 * The polygon is cut out of the *background itself* and redrawn over the
 * character, so a mask costs no extra art and can never drift out of register
 * with the painting it came from — which a separately-exported PNG eventually
 * does.
 *
 * The character is hidden behind the mask when their feet are above `baseline`,
 * i.e. when they are standing further from the camera than the object's own
 * footing.
 */
export interface ForegroundMask {
  id: string;
  shape: Polygon;
  /** Room-space y where this object meets the ground. */
  baseline: number;
}

/** Something the player can look at, talk to, pick up or use. */
export interface Hotspot {
  id: string;
  /** Shown when the cursor is over it. */
  name: string;
  shape: Polygon;
  /** Where the character stands to interact; defaults to the nearest walkable point. */
  approach?: Point;
}

/** A way out of the room. */
export interface Exit {
  id: string;
  name: string;
  shape: Polygon;
  /** Room this exit leads to. */
  to: string;
  /** Named entrance in the destination room to arrive at. */
  entrance: string;
  approach?: Point;
}

/** Where the character appears when arriving from somewhere else. */
export interface Entrance {
  at: Point;
  facing: Facing;
}

export type Facing = "front" | "back" | "left" | "right";

export interface Room {
  id: string;
  /** URL of the processed background, served out of art/rooms. */
  background: string;
  /**
   * Where the character may stand. Several polygons are treated as one region:
   * a courtyard joined to the alley that leaves it needs no special case, and
   * pathfinding walks the union.
   */
  walkable: Polygon[];
  /** At least two stops, in any order; the engine sorts them. */
  scale: ScaleStop[];
  foreground: ForegroundMask[];
  hotspots: Hotspot[];
  exits: Exit[];
  entrances: Record<string, Entrance>;
}

/**
 * Character scale at a given depth, clamped outside the authored range so a
 * character who ends up slightly off the ramp keeps a sane size rather than
 * inverting or vanishing.
 */
export function scaleAt(stops: readonly ScaleStop[], y: number): number {
  const sorted = [...stops].sort((a, b) => a.y - b.y);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) throw new Error("scale ramp needs at least one stop");

  if (y <= first.y) return first.scale;
  if (y >= last.y) return last.scale;

  for (let i = 1; i < sorted.length; i++) {
    const lower = sorted[i - 1]!;
    const upper = sorted[i]!;
    if (y <= upper.y) {
      const span = upper.y - lower.y;
      if (span === 0) return upper.scale;
      const t = (y - lower.y) / span;
      return lower.scale + (upper.scale - lower.scale) * t;
    }
  }
  return last.scale;
}

/** Whether a point lies inside a polygon, by the even-odd rule. */
export function isInside(polygon: Polygon, point: Point): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    const straddles = a.y > point.y !== b.y > point.y;
    if (straddles && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Whether a point lies in any of the room's walkable polygons. */
export function isWalkable(room: Room, point: Point): boolean {
  return room.walkable.some((polygon) => isInside(polygon, point));
}
