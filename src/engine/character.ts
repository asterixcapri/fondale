import { AnimatedSprite, Container, type Texture } from "pixi.js";

import { type Facing, type Point, type Room, scaleAt } from "./room";

/** How fast the walk cycle plays, independent of how fast the character moves. */
const WALK_FPS = 10;

/** Room pixels per second at full scale; slower when further away, so a
 *  character crossing the back of a room does not appear to sprint. */
const WALK_SPEED = 70;

/**
 * The player's character.
 *
 * Position is the point *between the feet*, which is what everything else in
 * the engine reasons about: it is the point the walkable polygon is tested
 * against, the point the scale ramp is read at, and the point depth sorting
 * compares. The sprite hangs above it.
 */
export class Character {
  readonly view: Container;

  private readonly sprite: AnimatedSprite;
  private position: Point;
  private facing: Facing = "front";
  private path: Point[] = [];
  private arrived?: () => void;

  constructor(frames: Texture[], start: Point) {
    this.sprite = new AnimatedSprite(frames);
    this.sprite.animationSpeed = WALK_FPS / 60;
    // Anchored at the bottom centre, matching where the sprite tool put the
    // feet in each cell.
    this.sprite.anchor.set(0.5, 1);

    this.view = new Container();
    this.view.addChild(this.sprite);

    this.position = { ...start };
  }

  get at(): Point {
    return { ...this.position };
  }

  /** True while there is still path left to walk. */
  get walking(): boolean {
    return this.path.length > 0;
  }

  place(point: Point, facing: Facing = this.facing): void {
    this.position = { ...point };
    this.facing = facing;
    this.path = [];
    this.sprite.gotoAndStop(0);
  }

  /** Walks the given waypoints in order, then calls back. */
  follow(path: Point[], done?: () => void): void {
    this.path = path.map((p) => ({ ...p }));
    this.arrived = done;
    if (this.path.length > 0) this.sprite.play();
  }

  stop(): void {
    this.path = [];
    this.sprite.gotoAndStop(0);
  }

  /**
   * Advances the walk and lays the sprite out for this frame.
   *
   * @param delta seconds since the previous frame
   */
  update(delta: number, room: Room): void {
    this.advance(delta, room);

    const scale = scaleAt(room.scale, this.position.y);
    // Mirrored rather than drawn twice: the strip faces right, so facing left
    // is a negative x scale. Sprites drawn front-on ignore this.
    const flip = this.facing === "left" ? -1 : 1;
    this.sprite.scale.set(scale * flip, scale);

    // Whole pixels only. A sprite on a half pixel samples its source twice as
    // wide in places, which on pixel art shows up as a shimmering edge.
    this.view.x = Math.round(this.position.x);
    this.view.y = Math.round(this.position.y);

    // Depth against the room's foreground masks is decided by the feet.
    this.view.zIndex = this.position.y;
  }

  private advance(delta: number, room: Room): void {
    if (this.path.length === 0) return;

    // Distance covered shrinks with the character, so apparent speed across
    // the screen stays even as they walk into the distance.
    let remaining = WALK_SPEED * scaleAt(room.scale, this.position.y) * delta;

    while (remaining > 0 && this.path.length > 0) {
      const target = this.path[0]!;
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const gap = Math.hypot(dx, dy);

      if (gap <= remaining) {
        this.position = { ...target };
        this.path.shift();
        remaining -= gap;
        continue;
      }

      this.position = {
        x: this.position.x + (dx / gap) * remaining,
        y: this.position.y + (dy / gap) * remaining,
      };
      this.faceAlong(dx, dy);
      remaining = 0;
    }

    if (this.path.length === 0) {
      this.sprite.gotoAndStop(0);
      const done = this.arrived;
      this.arrived = undefined;
      done?.();
    }
  }

  /**
   * Picks a facing from the direction of travel.
   *
   * Sideways wins ties generously — a character walking mostly along the
   * street but drifting a little towards the camera should stay in profile
   * rather than flicking to front-on for a step.
   */
  private faceAlong(dx: number, dy: number): void {
    if (Math.abs(dx) * 1.4 >= Math.abs(dy)) {
      this.facing = dx < 0 ? "left" : "right";
    } else {
      this.facing = dy > 0 ? "front" : "back";
    }
  }
}
