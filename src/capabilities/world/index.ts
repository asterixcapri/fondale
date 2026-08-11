import type { Point } from "../game-project";

export { isInside, navigationPath, nearestPoint } from "./geometry";

/** World-owned interpolation for Object and Scenery Motion paths. */
export function pointAlongPath(path: readonly Point[], progress: number): Point {
  if (path.length === 1) return { ...path[0]! };
  const lengths = path.slice(1).map((point, index) =>
    Math.hypot(point.x - path[index]!.x, point.y - path[index]!.y),
  );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total === 0) return { ...path.at(-1)! };
  let remaining = total * progress;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining <= length) {
      const start = path[index]!;
      const end = path[index + 1]!;
      const ratio = length === 0 ? 1 : remaining / length;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    remaining -= length;
  }
  return { ...path.at(-1)! };
}
