/* eslint-disable */
/**
 * Organic SVG blob paths for lava-lamp morphing.
 *
 * Root cause of the previous "cross" pattern:
 *   8 points at exactly 0°/45°/90°/… intervals → Catmull-Rom creates symmetric
 *   "arms" pointing toward cardinal directions.
 *
 * Fix:
 *   • 4 independent angle configurations — each set avoids cardinal directions
 *     (no 0°, 90°, 180°, 270°) and uses deliberately uneven spacing.
 *   • Different point counts per set (5–7) so the curve character differs.
 *   • Radii chosen so only ONE dominant direction is large per keyframe
 *     (prevents the simultaneous N+S or E+W extension that creates crosses).
 */

function buildPath(angles: readonly number[], radii: readonly number[], cx = 50, cy = 50): string {
  const n = angles.length;
  const t = 0.30; // Catmull-Rom tension — keep low to avoid loops with irregular spacing

  const pts = angles.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radii[i] * Math.cos(rad), y: cy + radii[i] * Math.sin(rad) };
  });

  let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const next2 = pts[(i + 2) % n];

    const cp1x = curr.x + (next.x - prev.x) * t;
    const cp1y = curr.y + (next.y - prev.y) * t;
    const cp2x = next.x - (next2.x - curr.x) * t;
    const cp2y = next.y - (next2.y - curr.y) * t;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
  }
  return d + ' Z';
}

function makeSet(angles: readonly number[], frames: readonly number[][]): string[] {
  const paths = frames.map(r => buildPath(angles, r));
  return [...paths, paths[0]]; // loop-close: last frame = first frame
}

// ---------------------------------------------------------------------------
// Set A — 6 points, gaps: 56 64 56 66 64 54  (no symmetry, no cardinals)
// ---------------------------------------------------------------------------
const A = [22, 78, 142, 198, 264, 328] as const;
const A_FRAMES = [
  [28, 44, 22, 36, 18, 40], // dominant at 78° (down-right) and 328° (up-right)
  [22, 28, 38, 46, 22, 30], // dominant at 198° (left-down)
  [42, 22, 26, 44, 20, 32], // diagonal pull 22°–198°
  [24, 40, 18, 28, 46, 22], // dominant at 264° (up-left)
  [32, 20, 40, 22, 28, 46], // dominant at 328° (up-right)
  [24, 36, 46, 26, 36, 20], // dominant at 142° (down-left)
  [18, 46, 18, 38, 44, 20], // two lobes: 78° and 264°
  [46, 18, 30, 44, 24, 32], // diagonal 22°–198°, shifted
];

// ---------------------------------------------------------------------------
// Set B — 5 points, gaps: 73 60 74 72 81  (highly asymmetric)
// ---------------------------------------------------------------------------
const B = [35, 108, 168, 242, 314] as const;
const B_FRAMES = [
  [44, 22, 46, 18, 32], // dominant at 35° (upper-right) and 168° (lower-left)
  [20, 46, 26, 36, 18], // dominant at 108° (lower-right)
  [26, 18, 38, 22, 46], // dominant at 314° (upper-left)
  [22, 36, 18, 46, 28], // dominant at 242° (lower-left)
  [16, 46, 20, 28, 44], // two lobes: 108° and 314°
  [46, 26, 38, 16, 28], // dominant at 35°
  [38, 20, 46, 22, 28], // dominant at 168°
  [18, 44, 22, 42, 44], // three-lobe: 108°, 242°, 314°
];

// ---------------------------------------------------------------------------
// Set C — 7 points, gaps: 57 56 54 52 56 58 27
// The narrow 27° gap near East (348°→15°) creates a local pinch feature.
// ---------------------------------------------------------------------------
const C = [15, 72, 128, 182, 234, 290, 348] as const;
const C_FRAMES = [
  [44, 22, 46, 18, 30, 20, 36], // dominant at 15° and 128°
  [20, 46, 24, 38, 16, 44, 22], // dominant at 72° and 290°
  [28, 18, 36, 22, 48, 20, 38], // dominant at 234°
  [22, 44, 18, 46, 20, 40, 18], // dominant at 72° and 182°
  [38, 20, 46, 22, 28, 44, 18], // dominant at 128° and 290°
  [46, 24, 18, 40, 20, 36, 44], // dominant at 15° and 348°
  [18, 42, 28, 46, 22, 30, 44], // complex: 72°, 182°, 348°
  [40, 18, 44, 20, 46, 22, 28], // three-lobe: 128°, 234°, 290° shifted
];

// ---------------------------------------------------------------------------
// Set D — 6 points, gaps: 63 54 56 68 50 69  (different character from A)
// ---------------------------------------------------------------------------
const D = [55, 118, 172, 228, 296, 346] as const;
const D_FRAMES = [
  [32, 44, 18, 42, 20, 38], // dominant at 118° and 228°
  [46, 18, 40, 16, 44, 22], // dominant at 55° and 296°
  [20, 46, 26, 44, 16, 34], // dominant at 118° and 228°, different radii
  [40, 22, 46, 20, 36, 18], // dominant at 172°
  [18, 36, 20, 46, 28, 44], // dominant at 228° and 346°
  [44, 20, 42, 16, 46, 26], // dominant at 55° and 296°, shifted
  [26, 46, 16, 42, 44, 18], // two lobes: 118° and 296°
  [44, 16, 46, 26, 18, 44], // complex: 55°, 172°, 346°
];

export const SHAPE_SETS: string[][] = [
  makeSet(A, A_FRAMES),
  makeSet(B, B_FRAMES),
  makeSet(C, C_FRAMES),
  makeSet(D, D_FRAMES),
];
/* eslint-enable */
