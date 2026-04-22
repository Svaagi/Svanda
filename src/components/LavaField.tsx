import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { generateLavaBlobs } from 'components/lavaBlobs';
import { phaseDelay, useLavaLamp } from 'context/LavaLampContext';
import { useBlobPalette } from 'context/BlobColorContext';
import { useIsMobile } from 'hooks/useIsMobile';
import styles from './lavaField.module.css';

/** Simple string hash — converts section id to a numeric seed. */
function strHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h / 0xffffffff;
}

export interface LavaFieldProps {
  /** Unique section ID — namespaces SVG gradient/filter IDs */
  id: string;
  /** Flat array of 3–12 hex colors from the section palette */
  colors: string[];
}

const PALETTE_OPACITY: Record<string, number> = {
  subtle: 0.84,
  glossy: 0.92,
  bright: 0.96,
};

/*
 * METABALL FILTER PARAMETERS
 * ───────────────────────────
 * BLUR_STD = 8
 *   Gaussian blur radius in viewBox units.
 *   The metaball "bridge" forms when edge-to-edge gap < 0.72 × 8 ≈ 5.8 units.
 *
 *   At bottom (BOT_RX ≈ 14–19 for large blobs):
 *     Two large blobs merge when centers are < 38–43 units apart.
 *     startX values spread across 12–72, but blobs at the same bottomY
 *     are often 20–35 units apart → they WILL merge at the bottom ✓
 *
 *   At apex (RISE_RX ≈ 8–11):
 *     Two blobs separate when centers > 21–27 units apart.
 *     Blobs drift to different topX values as they rise → natural separation ✓
 *
 *   Why not feComposite:
 *     Adding feComposite(SourceGraphic, threshold, "in") would clip the output
 *     to the original unblurred ellipses. The liquid bridge between approaching
 *     blobs only exists in the blurred layer — SourceGraphic is transparent in
 *     the gap. feComposite kills the merge effect.
 *     We use the raw blur+threshold output so bridge pixels inherit their color
 *     from the blended gradients of both blobs — exactly like two wax masses
 *     touching.
 */
const BLUR_STD      = 4;
const THRESHOLD_MUL = 60;
const THRESHOLD_SUB = 22;
const FILTER_MARGIN = '-50%';
const FILTER_EXTENT = '200%';
const VIEWBOX       = 100;

const COLOR_MATRIX  = `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${THRESHOLD_MUL} -${THRESHOLD_SUB}`;

const EDGE_OPACITY  = 0.68;

const gradId  = (sectionId: string, blobId: string) => `rg-${sectionId}-${blobId}`;
const filterId = (sectionId: string) => `lf-${sectionId}`;

/*
 * Ease curve applied to every keyframe segment.
 * [0.4, 0, 0.6, 1] is a symmetric sigmoid — each segment starts slow,
 * accelerates in the middle, and eases out at the end.
 * Because rising takes 45% of the cycle and falling takes 33%, rising is
 * inherently slower — the ease just adds organic smoothness to each phase.
 */
const BLOB_EASE = [0.4, 0, 0.6, 1] as const;

const LavaField = ({ id, colors }: LavaFieldProps) => {
  // Each section gets its own blob set derived from its id + the global session seed.
  // startTime is shared so phaseDelay keeps blobs mid-cycle on mount.
  const { startTime, sessionSeed } = useLavaLamp();
  const { palette, blurEnabled } = useBlobPalette();
  const isMobile = useIsMobile();
  const opacity = PALETTE_OPACITY[palette] ?? PALETTE_OPACITY.subtle;

  /*
   * Desktop: 9 blobs (3 large + 6 medium). Mobile: 5 blobs (3 large + 2 medium).
   * The 12 small droplet blobs add the most per-frame cost with the least
   * visual return — drop them on both tiers.
   */
  const blobs = useMemo(() => {
    const all = generateLavaBlobs(strHash(id) + sessionSeed);
    return isMobile ? all.slice(0, 5) : all.slice(0, 9);
  }, [id, sessionSeed, isMobile]);

  /*
   * Assign two adjacent palette colors to each blob.
   * Adjacent colors create a subtle internal gradient that makes each blob
   * look like a distinct coloured wax mass.
   */
  const blobGradients = useMemo(() => {
    const n = colors.length;
    return blobs.map((_, i) => ({
      center: colors[i % n],
      edge:   colors[(i + 1) % n],
    }));
  }, [blobs, colors]);

  return (
    /*
     * preserveAspectRatio="none" — the 100×100 viewBox stretches to fill
     * the section. Blob coordinates in 0-100 units are section-percentages.
     */
    <svg
      className={styles.field}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={blurEnabled && !isMobile ? { filter: 'blur(8px)' } : undefined}
    >
      <defs>
        {blobs.map((blob, i) => (
          <radialGradient
            key={blob.id}
            id={gradId(id, blob.id)}
            cx="38%"
            cy="32%"
            r="68%"
          >
            <stop offset="0%"   stopColor={blobGradients[i].center} stopOpacity={opacity} />
            <stop offset="100%" stopColor={blobGradients[i].edge}   stopOpacity={opacity * EDGE_OPACITY} />
          </radialGradient>
        ))}

        <filter
          id={filterId(id)}
          x={FILTER_MARGIN}
          y={FILTER_MARGIN}
          width={FILTER_EXTENT}
          height={FILTER_EXTENT}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={BLUR_STD} result="blur" />
          <feColorMatrix in="blur" type="matrix" values={COLOR_MATRIX} />
        </filter>
      </defs>

      {/*
       * All blobs in one filtered group — the filter processes them as a whole,
       * so overlapping Gaussian halos produce the smooth metaball merge effect.
       *
       * Animation: repeatType='loop' with first keyframe = last keyframe
       *   → seamless continuous cycle (no jump at the loop point).
       *
       * Phase adjustment: phaseDelay() computes a negative delay so that
       *   newly mounted sections join the animation mid-cycle at the correct
       *   position — blobs appear to have been running since app start.
       *
       * cx / cy — lava lamp cycle trajectory (rise → top → fall → bottom)
       * rx / ry — volume-preserving deformation (narrow+tall when rising,
       *           wide+flat when resting at bottom)
       */}
      <g filter={isMobile ? undefined : `url(#${filterId(id)})`}>
        {blobs.map((blob) => (
          <motion.ellipse
            key={blob.id}
            fill={`url(#${gradId(id, blob.id)})`}
            cx={blob.cx[0]}
            cy={blob.cy[0]}
            rx={blob.rx}
            ry={blob.ry}
            animate={{ cx: blob.cx, cy: blob.cy }}
            transition={{
              duration:   blob.duration,
              delay:      phaseDelay(blob, startTime),
              repeat:     Infinity,
              repeatType: 'loop',      // directed cycle: bottom→rise→top→fall→bottom
              times:      blob.times,
              ease:       BLOB_EASE,
            }}
          />
        ))}
      </g>
    </svg>
  );
};

export default LavaField;
