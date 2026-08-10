import type { LogicalResolution, Point, SceneSize } from "../public/definitions";

export interface CameraInput {
  readonly viewport: LogicalResolution;
  readonly scene: SceneSize;
  readonly follow?: Point;
  readonly continuous: boolean;
}

/** Internal, transient projection from Scene Space into the logical viewport. */
export class Camera {
  private current: Point = { x: 0, y: 0 };
  private target: Point = { x: 0, y: 0 };
  private velocity: Point = { x: 0, y: 0 };

  update(input: CameraInput): Point {
    if (!input.follow) {
      this.current = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      return this.current;
    }

    if (!input.continuous) {
      this.target = this.clamp({
        x: input.follow.x - input.viewport.width / 2,
        y: input.follow.y - input.viewport.height / 2,
      }, input);
      this.current = this.target;
      this.velocity = { x: 0, y: 0 };
    } else {
      this.target = this.followTarget(input);
      const horizontal = approach(this.current.x, this.target.x, this.velocity.x);
      const vertical = approach(this.current.y, this.target.y, this.velocity.y);
      this.current = {
        x: horizontal.value,
        y: vertical.value,
      };
      this.velocity = {
        x: horizontal.velocity,
        y: vertical.velocity,
      };
    }

    return this.clamp({
      x: Math.round(this.current.x),
      y: Math.round(this.current.y),
    }, input);
  }

  private followTarget(input: CameraInput): Point {
    const horizontalInset = input.viewport.width * 0.4;
    const verticalInset = input.viewport.height * 0.4;
    const relative = {
      x: input.follow!.x - this.target.x,
      y: input.follow!.y - this.target.y,
    };
    const next = { ...this.target };
    if (relative.x < horizontalInset) next.x = input.follow!.x - horizontalInset;
    if (relative.x > input.viewport.width - horizontalInset) {
      next.x = input.follow!.x - (input.viewport.width - horizontalInset);
    }
    if (relative.y < verticalInset) next.y = input.follow!.y - verticalInset;
    if (relative.y > input.viewport.height - verticalInset) {
      next.y = input.follow!.y - (input.viewport.height - verticalInset);
    }
    return this.clamp(next, input);
  }

  private clamp(point: Point, input: CameraInput): Point {
    return {
      x: Math.max(0, Math.min(input.scene.width - input.viewport.width, point.x)),
      y: Math.max(0, Math.min(input.scene.height - input.viewport.height, point.y)),
    };
  }
}

function approach(current: number, target: number, velocity: number): {
  value: number;
  velocity: number;
} {
  const remaining = target - current;
  if (Math.abs(remaining) < 0.01 && Math.abs(velocity) < 0.01) {
    return { value: target, velocity: 0 };
  }
  const directedVelocity = Math.sign(velocity) === Math.sign(remaining) ? velocity : 0;
  const nextVelocity = (directedVelocity + remaining * 0.08) * 0.72;
  if (Math.abs(nextVelocity) >= Math.abs(remaining)) {
    return { value: target, velocity: 0 };
  }
  return { value: current + nextVelocity, velocity: nextVelocity };
}
