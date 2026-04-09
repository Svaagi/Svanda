import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { phaseDelay, useLavaLamp } from 'context/LavaLampContext';
import { useBlobPalette } from 'context/BlobColorContext';
import styles from './globalLavaLamp.module.css';

const PALETTE_OPACITY: Record<string, number> = {
  subtle: 0.84,
  glossy: 0.92,
  bright: 0.96,
};

/*
 * GLOBAL LAVA LAMP
 * ─────────────────
 * Rendered ONCE in App.tsx.
 * position: fixed  →  stays in the viewport regardless of scroll.
 * z-index: -1      →  paints above the body background (#06000f) but
 *                     below all in-flow content and above-zero z-index elements.
 *
 * Sections that are transparent let the lamp show through.
 * Light sections use rgba(…, 0.75) so the lamp is subtle but present.
 * Dark sections are transparent, showing the lamp fully.
 *
 * COLORS
 * ───────
 * A single unified palette drawn from all section brand colors.
 * Adjacent entries are assigned to each blob (center → edge gradient),
 * cycling through the palette as blobIdx increments.
 */

const PALETTE: readonly string[] = [
  '#ff941e', // orange-warm
  '#e83e4c', // red-pink
  '#d466a0', // rose
  '#9494c0', // lavender
  '#7000ff', // deep violet
  '#b200e4', // electric purple
  '#f51266', // magenta
  '#4facfe', // sky blue
  '#ffc300', // gold
  '#eb7800', // amber
  '#00c6a2', // teal
  '#b2d0c4', // sage
];

/*
 * METABALL FILTER PARAMETERS
 * ───────────────────────────
 * BLUR_STD = 7
 *   The merge "bridge" forms when edge-to-edge gap < 0.72 × 7 ≈ 5 units.
 *   In the 100-unit viewbox this is 5% of the viewport.
 *
 *   Two large blobs (rx=13 each) merge when centers < 31 units apart.
 *   Most adjacent blobs in the bottom pool are 10-25 units apart → merged.
 *   At the apex, they drift 15-25 units apart → separated.
 *
 * THRESHOLD α = 9/25 = 0.36  →  crisp liquid boundary.
 *
 * Why no feComposite:
 *   The merge bridge only exists in the blurred layer.
 *   SourceGraphic is transparent in the gap — feComposite would delete it.
 *   Raw blur+threshold lets bridge pixels inherit blended colors from both
 *   blobs' gradients, exactly like two wax masses touching.
 */
const BLUR_STD = 4;
const THRESHOLD_MUL = 60;
const THRESHOLD_SUB = 22;
const FILTER_MARGIN = '-50%';
const FILTER_EXTENT = '200%';

const COLOR_MATRIX = `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${THRESHOLD_MUL} -${THRESHOLD_SUB}`;

const EDGE_OPACITY  = 0.60;

/*
 * Ease applied to every keyframe segment.
 * Sigmoid curve: slow at the extremes (resting at top/bottom),
 * faster through the middle. This gives the wax its heavy, viscous feel.
 */
const EASE = [0.4, 0, 0.6, 1] as const;

const GlobalLavaLamp = () => {
  const { blobs, startTime } = useLavaLamp();
  const { palette, blurEnabled } = useBlobPalette();
  const opacity = PALETTE_OPACITY[palette] ?? PALETTE_OPACITY.subtle;

  const blobColors = useMemo(() =>
    blobs.map((_, i) => ({
      center: PALETTE[i % PALETTE.length],
      edge:   PALETTE[(i + 1) % PALETTE.length],
    })),
  [blobs]);

  return (
    /*
     * viewBox 0 0 100 100 + preserveAspectRatio="none":
     *   blob positions in 0-100 units map to viewport-percentage.
     *   A blob at cx=50, cy=50 is always at the exact center of the viewport.
     */
    <svg
      className={styles.lamp}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={blurEnabled ? { filter: 'blur(8px)' } : undefined}
    >
      <defs>
        {blobs.map((blob, i) => (
          <radialGradient
            key={blob.id}
            id={`glg-${blob.id}`}
            cx="38%"
            cy="32%"
            r="68%"
          >
            <stop offset="0%"   stopColor={blobColors[i].center} stopOpacity={opacity} />
            <stop offset="100%" stopColor={blobColors[i].edge}   stopOpacity={opacity * EDGE_OPACITY} />
          </radialGradient>
        ))}

        <filter
          id="gl-metaball"
          x={FILTER_MARGIN}
          y={FILTER_MARGIN}
          width={FILTER_EXTENT}
          height={FILTER_EXTENT}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={BLUR_STD} result="blur" />
          <feColorMatrix  in="blur" type="matrix" values={COLOR_MATRIX} />
        </filter>
      </defs>

      {/*
       * All blobs share one filtered group — the filter sees the entire group
       * so overlapping halos from different blobs produce the smooth merge.
       *
       * ANIMATION DESIGN:
       *   repeatType: 'loop'   — directed cycle (not oscillation)
       *   times: CYCLE_TIMES   — rise takes 45%, fall takes 33%, pauses = 22%
       *   first keyframe === last keyframe → perfectly seamless loop
       *
       *   phaseDelay() returns a negative Framer Motion delay so this
       *   GlobalLavaLamp (and every section LavaField) joins mid-cycle at the
       *   exact phase that matches how long the app has been running.
       *   Blobs feel continuous regardless of when the component mounts.
       *
       * NO rx/ry animation.
       *   Each blob is a constant ellipse (rx ≠ ry → never a perfect circle).
       *   The only motion is cx/cy (position).
       *   Organic shape change comes from the metaball filter, not from
       *   individual blob scaling — which is exactly what "no scaling" means.
       */}
      <g filter="url(#gl-metaball)">
        {blobs.map((blob) => (
          <motion.ellipse
            key={blob.id}
            fill={`url(#glg-${blob.id})`}
            cx={blob.cx[0]}
            cy={blob.cy[0]}
            rx={blob.rx}
            ry={blob.ry}
            animate={{ cx: blob.cx, cy: blob.cy }}
            transition={{
              duration:   blob.duration,
              delay:      phaseDelay(blob, startTime),
              repeat:     Infinity,
              repeatType: 'loop',
              times:      [...blob.times],
              ease:       EASE,
            }}
          />
        ))}
      </g>
    </svg>
  );
};

export default GlobalLavaLamp;
