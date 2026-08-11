import type {
  AuthoringDiagnostic,
  LogicalResolution,
  Point,
  SceneSize,
} from "../game-project";
import type { CueStart, DirectedSubject } from "../sequence";

export type CameraDirection =
  | { readonly type: "camera"; readonly mode: "cut"; readonly point: Point; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "move"; readonly from: Point; readonly to: Point; readonly duration: number; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "hold"; readonly point: Point; readonly duration?: number; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "follow"; readonly subject: DirectedSubject; readonly duration?: number; readonly startAfter?: CueStart };

export function validateCameraDirection(
  direction: CameraDirection,
  path: string,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if ("duration" in direction && direction.duration !== undefined &&
      (!Number.isFinite(direction.duration) || direction.duration <= 0)) {
    diagnostics.push({
      code: "definition.camera.duration",
      family: "definition",
      owner: "camera",
      path: `${path}.duration`,
      message: "A Camera duration must be positive and finite.",
    });
  }
  for (const [pointName, point] of cameraPoints(direction)) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      diagnostics.push({
        code: "definition.camera.point.finite",
        family: "definition",
        owner: "camera",
        path: `${path}.${pointName}`,
        message: "A Camera point must use finite Scene Space coordinates.",
      });
    }
  }
  return diagnostics;
}

export interface CameraReferenceContext {
  readonly hasScene: boolean;
  readonly subjectExists: (subject: DirectedSubject) => boolean;
  readonly subjectBelongsToScene: (subject: DirectedSubject) => boolean;
  readonly pointInScene: (point: Point) => boolean;
}

export function validateCameraDirectionReferences(
  direction: CameraDirection,
  path: string,
  context: CameraReferenceContext,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (direction.mode === "follow") {
    if (!context.subjectExists(direction.subject)) {
      diagnostics.push({ code: "reference.camera.subject", family: "reference", owner: "camera", path: `${path}.subject`, message: "Camera follow subject does not exist." });
    } else if (context.hasScene && !context.subjectBelongsToScene(direction.subject)) {
      diagnostics.push({ code: "reference.camera.subject-scene", family: "reference", owner: "camera", path: `${path}.subject`, message: "A Camera follow subject must belong to the Sequence Scene." });
    }
  }
  for (const [pointName, point] of cameraPoints(direction)) {
    if (context.hasScene && context.pointInScene(point)) continue;
    if (context.hasScene) {
      diagnostics.push({ code: "definition.camera.bounds", family: "definition", owner: "camera", path: `${path}.${pointName}`, message: "A Camera destination must remain inside the Sequence Scene Size." });
    }
  }
  return diagnostics;
}

function cameraPoints(direction: CameraDirection): readonly (readonly ["point" | "from" | "to", Point])[] {
  if (direction.mode === "cut" || direction.mode === "hold") return [["point", direction.point]];
  if (direction.mode === "move") return [["from", direction.from], ["to", direction.to]];
  return [];
}

export interface ActiveCameraDirection {
  readonly direction: CameraDirection;
  readonly localTick: number;
  readonly presented: boolean;
  readonly durationTicks?: number;
}

export interface CameraPresentation {
  readonly directed: boolean;
  readonly focus?: Point;
  readonly origin: Point;
}

export interface CameraInput {
  readonly tick: number;
  readonly scene: string;
  readonly viewport: LogicalResolution;
  readonly sceneSize: SceneSize;
  readonly player?: Point;
  readonly directions: readonly ActiveCameraDirection[];
  readonly pointForSubject: (subject: DirectedSubject) => Point | undefined;
}

/** Internal, transient projection from Scene Space into the logical viewport. */
export class Camera {
  private current: Point = { x: 0, y: 0 };
  private target: Point = { x: 0, y: 0 };
  private velocity: Point = { x: 0, y: 0 };
  private lastTick: number | undefined;
  private lastScene: string | undefined;
  private wasDirected = false;
  private presentation: CameraPresentation | undefined;

  update(input: CameraInput): CameraPresentation {
    if (this.lastTick === input.tick && this.lastScene === input.scene && this.presentation) {
      return this.presentation;
    }
    const active = input.directions.findLast(({ presented }) => presented);
    const directedFocus = active?.direction.mode === "move"
      ? pointAlongMove(active.direction, active.localTick, active.durationTicks)
      : active?.direction.mode === "cut" || active?.direction.mode === "hold"
        ? active.direction.point
        : active?.direction.mode === "follow"
          ? input.pointForSubject(active.direction.subject)
        : undefined;
    const directed = directedFocus !== undefined;
    const focus = directedFocus ?? input.player;
    if (!focus) {
      this.current = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      return this.remember(input, false, undefined, this.current);
    }

    const centred = this.clamp({
        x: focus.x - input.viewport.width / 2,
        y: focus.y - input.viewport.height / 2,
      }, input);
    const continuous = this.lastTick !== undefined &&
      this.lastScene === input.scene &&
      !directed &&
      !this.wasDirected;
    if (!continuous) {
      this.target = centred;
      this.current = centred;
      this.velocity = { x: 0, y: 0 };
    } else {
      const ticks = Math.max(1, input.tick - this.lastTick!);
      for (let tick = 0; tick < ticks; tick += 1) {
        this.target = this.followTarget(focus, input);
        const horizontal = approach(this.current.x, this.target.x, this.velocity.x);
        const vertical = approach(this.current.y, this.target.y, this.velocity.y);
        this.current = { x: horizontal.value, y: vertical.value };
        this.velocity = { x: horizontal.velocity, y: vertical.velocity };
      }
    }

    const origin = this.clamp({
      x: Math.round(this.current.x),
      y: Math.round(this.current.y),
    }, input);
    return this.remember(input, directed, focus, origin);
  }

  private remember(
    input: CameraInput,
    directed: boolean,
    focus: Point | undefined,
    origin: Point,
  ): CameraPresentation {
    this.lastTick = input.tick;
    this.lastScene = input.scene;
    this.wasDirected = directed;
    this.presentation = Object.freeze({
      directed,
      ...(focus ? { focus: Object.freeze({ ...focus }) } : {}),
      origin: Object.freeze({ ...origin }),
    });
    return this.presentation;
  }

  private followTarget(focus: Point, input: CameraInput): Point {
    const horizontalInset = input.viewport.width * 0.4;
    const verticalInset = input.viewport.height * 0.4;
    const relative = {
      x: focus.x - this.target.x,
      y: focus.y - this.target.y,
    };
    const next = { ...this.target };
    if (relative.x < horizontalInset) next.x = focus.x - horizontalInset;
    if (relative.x > input.viewport.width - horizontalInset) {
      next.x = focus.x - (input.viewport.width - horizontalInset);
    }
    if (relative.y < verticalInset) next.y = focus.y - verticalInset;
    if (relative.y > input.viewport.height - verticalInset) {
      next.y = focus.y - (input.viewport.height - verticalInset);
    }
    return this.clamp(next, input);
  }

  private clamp(point: Point, input: CameraInput): Point {
    return {
      x: Math.max(0, Math.min(input.sceneSize.width - input.viewport.width, point.x)),
      y: Math.max(0, Math.min(input.sceneSize.height - input.viewport.height, point.y)),
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

function pointAlongMove(
  direction: Extract<CameraDirection, { readonly mode: "move" }>,
  localTick: number,
  durationTicks: number | undefined,
): Point {
  if (durationTicks === undefined) {
    throw new Error("A Camera move needs its Sequence-interpreted duration in logical ticks.");
  }
  const progress = Math.min(1, Math.max(0, localTick / durationTicks));
  return {
    x: direction.from.x + (direction.to.x - direction.from.x) * progress,
    y: direction.from.y + (direction.to.y - direction.from.y) * progress,
  };
}
