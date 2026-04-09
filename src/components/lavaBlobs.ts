/**
 * Lava lamp blob generator — seeded random, proper directed cycle.
 *
 * DESIGN CONTRACT
 * ───────────────
 * • rx / ry are CONSTANTS. They never animate. No scaling, ever.
 *   Shape change comes entirely from the metaball filter when blobs
 *   get close (halos overlap → merge) and drift apart (→ split).
 *
 * • Every blob cycles bottom → rise → top → fall → bottom with
 *   repeatType: 'loop' (first keyframe === last → seamless).
 *
 * • Rising takes 45% of the cycle; falling takes 33%.
 *   Rising is always slower than falling — this is the lava lamp feel.
 *
 * • The ascent and descent use different horizontal paths (S-curve),
 *   so the loop never looks like a mirror/oscillation.
 *
 * CYCLE TIMING (8 keyframes, indices 0-7)
 * ────────────────────────────────────────
 *   idx  time   phase
 *    0   0.00   bottom — loop start
 *    1   0.07   bottom — end of heating pause
 *    2   0.30   mid-rise waypoint (35% up, slight drift)
 *    3   0.52   apex — end of rise
 *    4   0.60   apex — end of cooling pause
 *    5   0.82   mid-fall waypoint (different path from rise → S-curve)
 *    6   0.93   bottom — arriving
 *    7   1.00   bottom — loop end  ← MUST EQUAL idx 0 (seamless loop)
 *
 * BLOB TIERS
 * ───────────
 *   large  × 2   rx 11-14  ry 13-17   36-46 s/cycle   most visible
 *   medium × 4   rx  7-10  ry  9-12   24-34 s/cycle   connectors
 *   small  × 6   rx  3- 6  ry  4- 8   14-22 s/cycle   droplets
 *
 * RANDOMISATION
 * ─────────────
 *   generateLavaBlobs(seed) uses a seeded LCG PRNG so every call with
 *   a different seed produces a different set of positions, drift
 *   directions, sizes, durations, and phase offsets.
 *   The seed in LavaLampContext is Math.random() → different every page load.
 */

export interface LavaBlob {
  id: string;
  /** 8-element cx keyframes. cx[0] === cx[7] — seamless loop. */
  cx: number[];
  /** 8-element cy keyframes. cy[0] === cy[7] — seamless loop. */
  cy: number[];
  /** Constant x-radius. NEVER animates. */
  readonly rx: number;
  /** Constant y-radius. NEVER animates. */
  readonly ry: number;
  /** Time fractions for each of the 8 keyframes. */
  readonly times: readonly number[];
  /** Full cycle duration in seconds. */
  readonly duration: number;
  /**
   * Logical delay in seconds from app-start.
   * LavaLampContext.phaseDelay() converts this to a negative FM delay
   * so newly mounted sections join at the correct animation phase.
   */
  readonly delay: number;
}

// ---------------------------------------------------------------------------
// Cycle timing — shared by every blob
// ---------------------------------------------------------------------------
const CYCLE_TIMES = [0, 0.07, 0.30, 0.52, 0.60, 0.82, 0.93, 1.0] as const;

// ---------------------------------------------------------------------------
// Seeded LCG PRNG — deterministic, no dependencies
// ---------------------------------------------------------------------------
function makePrng(seed: number) {
  let s = ((seed * 0xdeadbeef) ^ 0xfacecafe) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function rn(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ---------------------------------------------------------------------------
// Tier definitions
// ---------------------------------------------------------------------------
interface Tier {
  count:  number;
  rxMin:  number;  rxMax:  number;
  ryMin:  number;  ryMax:  number;
  durMin: number;  durMax: number;
}

const TIERS: readonly Tier[] = [
  // 3 large blobs — the dominant wax masses
  { count: 3, rxMin: 11, rxMax: 14, ryMin: 13, ryMax: 17, durMin: 80, durMax: 120 },
  // 6 medium blobs — connectors and independents
  { count: 6, rxMin:  7, rxMax: 10, ryMin:  9, ryMax: 12, durMin: 55, durMax: 80 },
  // 12 small blobs — droplets and surface pieces
  { count: 12, rxMin:  3, rxMax:  6, ryMin:  4, ryMax:  8, durMin: 35, durMax: 55 },
];

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------
export function generateLavaBlobs(seed: number): LavaBlob[] {
  const rng = makePrng(seed);
  const blobs: LavaBlob[] = [];
  let   idx  = 0;

  for (const tier of TIERS) {
    for (let i = 0; i < tier.count; i++) {
      // Size — within tier range, rx ≠ ry so never a perfect circle
      const rx = Math.round(rn(rng, tier.rxMin, tier.rxMax));
      const ry = Math.round(rn(rng, tier.ryMin, tier.ryMax));

      // Horizontal trajectory — allow blobs to be partially off-screen on edges
      // xMin/xMax let the center go past the edge so the blob is half-cropped
      const xMin   = -rx + 2;        // center can go left of viewport edge
      const xMax   = 100 + rx - 2;   // center can go right of viewport edge
      const startX = rn(rng, xMin, xMax);
      const driftX = rn(rng, -20, 20);
      const topX   = clamp(startX + driftX, xMin, xMax);

      // S-curve fall waypoint
      const wobble   = rn(rng, -12, 12);
      const midFallX = clamp((topX + startX) / 2 + wobble, xMin, xMax);

      // Mid-rise cx
      const midRiseX = clamp(startX + driftX * 0.55, xMin, xMax);

      // Vertical positions — top/bottom can also be partially off-screen
      const botY     = rn(rng, 78, Math.min(96, 100 + ry - 2));  // bottom (resting zone)
      const topY     = rn(rng, Math.max(-ry + 2, 0), Math.max(ry + 8, 20));  // apex
      const midRiseY = rn(rng, 38, 58);  // rise waypoint (mid-field)
      const midFallY = rn(rng, 42, 62);  // fall waypoint (slightly different)

      // Timing — duration and logical delay
      const duration = Math.round(rn(rng, tier.durMin, tier.durMax));
      const delay    = Math.round(rn(rng, 0, duration));

      const r2 = (v: number) => Math.round(v * 10) / 10;

      blobs.push({
        id: `lb-${idx}`,
        times: CYCLE_TIMES,
        //            [bot,          bot,          midRise,      apex,         apex,         midFall,      bot,          bot]
        cx: [r2(startX), r2(startX), r2(midRiseX), r2(topX),   r2(topX),   r2(midFallX), r2(startX), r2(startX)],
        cy: [r2(botY),   r2(botY),   r2(midRiseY), r2(topY),   r2(topY),   r2(midFallY), r2(botY),   r2(botY)  ],
        rx,
        ry,
        duration,
        delay,
      });

      idx++;
    }
  }

  return blobs;
}
