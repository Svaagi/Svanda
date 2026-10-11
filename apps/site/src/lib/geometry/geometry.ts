export type Point = {
  x: number;
  y: number;
};

// A quadrilateral, corners clockwise from the top left (y down).
export type Quad = {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
};

export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const MIN_POLYGON_POINTS = 3;

// Positive when o -> a -> b turns counter-clockwise (in y-down screen space: clockwise).
function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function halfHull(points: readonly Point[]): Point[] {
  const hull: Point[] = [];
  for (const point of points) {
    while (hull.length > 1) {
      const top = hull.length - 1;
      const last = hull[top];
      const beforeLast = hull[top - 1];
      if (!last || !beforeLast || cross(beforeLast, last, point) > 0) break;
      hull.pop();
    }
    hull.push(point);
  }
  hull.pop();
  return hull;
}

// Andrew's monotone chain. Collinear points are dropped; fewer than three distinct points
// come back as they are (sorted).
export function convexHull(points: readonly Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < MIN_POLYGON_POINTS) return sorted;
  return [...halfHull(sorted), ...halfHull([...sorted].reverse())];
}

// Even-odd ray casting.
export function isPointInPolygon(point: Point, polygon: readonly Point[]) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const current = polygon[i];
    const previous = polygon[j];
    if (!current || !previous) continue;
    const crossesRay =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          (previous.y - current.y) +
          current.x;
    if (crossesRay) isInside = !isInside;
  }
  return isInside;
}

export function polygonBounds(polygon: readonly Point[]): Bounds {
  const xs = polygon.map(({ x }) => x);
  const ys = polygon.map(({ y }) => y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}
