import type { Point } from "./index";

export function isInside(polygon: readonly Point[], point: Point): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const left = polygon[index]!;
    const right = polygon[previous]!;
    const straddles = left.y > point.y !== right.y > point.y;
    if (
      straddles &&
      point.x < ((right.x - left.x) * (point.y - left.y)) / (right.y - left.y) + left.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function closestOnSegment(start: Point, end: Point, point: Point): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const squaredLength = dx * dx + dy * dy;
  if (squaredLength === 0) return { ...start };
  const progress = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / squaredLength),
  );
  return { x: start.x + progress * dx, y: start.y + progress * dy };
}

export function nearestPoint(polygon: readonly Point[], point: Point): Point {
  if (isInside(polygon, point)) return { ...point };
  let nearest = polygon[0] ? { ...polygon[0] } : { ...point };
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const candidate = closestOnSegment(polygon[previous]!, polygon[index]!, point);
    const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return nearest;
}

/** Shortest deterministic visibility route that remains inside a simple polygon. */
export function navigationPath(
  polygon: readonly Point[],
  start: Point,
  destination: Point,
): Point[] {
  const nodes = [{ ...start }, { ...destination }, ...polygon.map((point) => ({ ...point }))];
  const distances = nodes.map(() => Number.POSITIVE_INFINITY);
  const previous = nodes.map<number | undefined>(() => undefined);
  const visited = new Set<number>();
  distances[0] = 0;

  while (visited.size < nodes.length) {
    let current = -1;
    for (let index = 0; index < nodes.length; index += 1) {
      if (visited.has(index)) continue;
      if (current === -1 || distances[index]! < distances[current]!) current = index;
    }
    if (current === -1 || !Number.isFinite(distances[current])) break;
    if (current === 1) break;
    visited.add(current);
    for (let candidate = 0; candidate < nodes.length; candidate += 1) {
      if (candidate === current || visited.has(candidate)) continue;
      if (!segmentWithinPolygon(polygon, nodes[current]!, nodes[candidate]!)) continue;
      const nextDistance = distances[current]! + Math.hypot(
        nodes[candidate]!.x - nodes[current]!.x,
        nodes[candidate]!.y - nodes[current]!.y,
      );
      if (nextDistance < distances[candidate]! - 1e-9) {
        distances[candidate] = nextDistance;
        previous[candidate] = current;
      }
    }
  }

  if (!Number.isFinite(distances[1])) return [{ ...start }];
  const indexes: number[] = [];
  for (let cursor: number | undefined = 1; cursor !== undefined; cursor = previous[cursor]) {
    indexes.push(cursor);
    if (cursor === 0) break;
  }
  return indexes.reverse().map((index) => ({ ...nodes[index]! }));
}

function segmentWithinPolygon(
  polygon: readonly Point[],
  start: Point,
  end: Point,
): boolean {
  const parameters = [0, 1];
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    parameters.push(...intersectionParameters(start, end, polygon[previous]!, polygon[index]!));
  }
  const ordered = [...new Set(parameters.map((value) => Math.max(0, Math.min(1, value)).toFixed(10)))]
    .map(Number)
    .sort((left, right) => left - right);
  for (let index = 1; index < ordered.length; index += 1) {
    const amount = (ordered[index - 1]! + ordered[index]!) / 2;
    const sample = {
      x: start.x + (end.x - start.x) * amount,
      y: start.y + (end.y - start.y) * amount,
    };
    if (!isInside(polygon, sample) && !isOnBoundary(polygon, sample)) return false;
  }
  return true;
}

function intersectionParameters(a: Point, b: Point, c: Point, d: Point): number[] {
  const rx = b.x - a.x;
  const ry = b.y - a.y;
  const sx = d.x - c.x;
  const sy = d.y - c.y;
  const denominator = rx * sy - ry * sx;
  const qx = c.x - a.x;
  const qy = c.y - a.y;
  if (Math.abs(denominator) < 1e-10) {
    if (Math.abs(qx * ry - qy * rx) >= 1e-10) return [];
    const lengthSquared = rx * rx + ry * ry;
    if (lengthSquared === 0) return [];
    return [
      (qx * rx + qy * ry) / lengthSquared,
      ((d.x - a.x) * rx + (d.y - a.y) * ry) / lengthSquared,
    ].filter((amount) => amount >= 0 && amount <= 1);
  }
  const amount = (qx * sy - qy * sx) / denominator;
  const edgeAmount = (qx * ry - qy * rx) / denominator;
  return amount >= 0 && amount <= 1 && edgeAmount >= 0 && edgeAmount <= 1 ? [amount] : [];
}

function isOnBoundary(polygon: readonly Point[], point: Point): boolean {
  return polygon.some((start, index) => {
    const end = polygon[(index + 1) % polygon.length]!;
    const cross = (point.x - start.x) * (end.y - start.y) -
      (point.y - start.y) * (end.x - start.x);
    return Math.abs(cross) < 1e-8 &&
      point.x >= Math.min(start.x, end.x) - 1e-8 &&
      point.x <= Math.max(start.x, end.x) + 1e-8 &&
      point.y >= Math.min(start.y, end.y) - 1e-8 &&
      point.y <= Math.max(start.y, end.y) + 1e-8;
  });
}
