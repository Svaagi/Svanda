import { ReactNode } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

// ─── Wipe catalogue ───────────────────────────────────────────────────────────
//
// Each entry describes how the OUTGOING section sculpts itself away.
// The section does NOT translate — its clip-path boundary morphs.
// The shaped seam at the bottom of the vanishing section IS the transition.
//
// Rules:
//  • from  = full rectangle (section fully visible)
//  • to    = all bottom points at ≤ 0 % so the section is completely gone
//  • Point count must match between from/to for smooth numeric interpolation
//  • Negative % values are valid in CSS clip-path and extend above the element
//
// ─────────────────────────────────────────────────────────────────────────────

export type TransitionType =
  | 'tiltLeft'   // diagonal seam — right edge retreats first
  | 'arch'       // dome seam — centre retreats first, outer edges last
  | 'wave'       // sinusoidal edge — two-cycle undulation
  | 'tiltRight'  // diagonal seam — left edge retreats first (mirror of tiltLeft)
  | 'chevron'    // inverted arch — outer corners retreat first, centre last
  | 'steps'      // 3-column staircase — right column exits first
  | 'notch';     // deep V-notch — centre cuts deepest, outer edges last

interface ClipWipe {
  from: string;
  to: string;
}

const WIPES: Record<TransitionType, ClipWipe> = {

  // ── 4 pts — straight diagonal. At midpoint the visible bottom edge
  //    runs from ~43 % (right) to ~50 % (left).
  tiltLeft: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100% -14%, 0%   0%)',
  },

  // ── 5 pts — dome arch. At midpoint centre is at ~37 %, corners at ~50 %.
  //    The seam curves upward in the middle, creating an arch window into
  //    the next section.
  arch: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%   0%, 50%  -25%, 0%   0%)',
  },

  // ── 10 pts — sinusoidal bottom edge (2 full cycles). Troughs at x=25 %
  //    and x=75 % travel further (-18 %) than peaks, so the wave is
  //    clearly visible during the mid-scroll phase.
  wave: {
    from: 'polygon(0% 0%, 25% 0%, 50% 0%, 75% 0%, 100% 0%, 100% 100%, 75% 100%, 50% 100%, 25% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 25% 0%, 50% 0%, 75% 0%, 100% 0%, 100%  -2%, 75%  -18%, 50%  -1%, 25%  -18%, 0%  -2%)',
  },

  // ── 4 pts — mirror of tiltLeft. Left edge retreats first.
  tiltRight: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%   0%, 0%  -14%)',
  },

  // ── 5 pts — inverted arch. Outer edges (-20 %) retreat faster than
  //    centre (0 %). At midpoint: corners at ~40 %, centre at ~50 %.
  //    The section's bottom appears to have its corners lifted while
  //    the centre holds on, forming a chevron/upward-V seam.
  chevron: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%  -20%, 50%   0%, 0%  -20%)',
  },

  // ── 8 pts — 3-column staircase. Right column to -40 %, middle to -18 %,
  //    left to -4 %. At midpoint the seam forms a clear staircase descending
  //    left-to-right across the viewport.
  steps: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 67% 100%, 67% 100%, 33% 100%, 33% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%  -40%, 67%  -40%, 67%  -18%, 33%  -18%, 33%  -4%, 0%  -4%)',
  },

  // ── 7 pts — deep V-notch at centre (to -40 %), shoulder points at -20 %,
  //    outer edges at 0 %. At midpoint the seam shows a sharp triangular
  //    indent growing from centre with visible shoulder geometry.
  notch: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 66% 100%, 50% 100%, 34% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%   0%, 66%  -20%, 50%  -40%, 34%  -20%, 0%   0%)',
  },

};

// ─── Component ────────────────────────────────────────────────────────────────

interface SectionRevealProps {
  children: ReactNode;
  zIndex: number;
  scrollYProgress: MotionValue<number>;
  /** Normalised [start, end] ∈ [0, 1] during which this section sculpts away.
   *  Omit for the final section — it is the permanent destination. */
  scrollRange?: [number, number];
  transition?: TransitionType;
  bgColor?: string;
}

const SectionReveal = ({
  children,
  zIndex,
  scrollYProgress,
  scrollRange,
  transition = 'tiltLeft',
  bgColor = 'transparent',
}: SectionRevealProps) => {
  const wipe = WIPES[transition];
  // Dummy range far beyond [0,1] — the last section never animates.
  const safeRange: [number, number] = scrollRange ?? [1, 1.01];

  // Animate clip-path: full rectangle → shaped collapsed boundary.
  // No translation — the section stays stationary and sculpts itself away.
  const clipPath = useTransform(scrollYProgress, safeRange, [wipe.from, wipe.to]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        overflow: 'hidden',
        backgroundColor: bgColor,
        ...(scrollRange ? { clipPath } : {}),
      }}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
