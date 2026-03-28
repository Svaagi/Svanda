import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

type Wipe = 'up' | 'tiltL' | 'tiltR';

// Each entry: [start, midpoint, final]
// Start: collapsed to a horizontal line at the bottom — section invisible.
// Final: permanent angled top edge — previous section color peeks through.
const CLIPS: Record<Wipe, [string, string, string]> = {
  up: [
    'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    'polygon(0% 45%,  50%  38%,  100% 45%,  100% 100%, 0% 100%)',
    'polygon(0% 5%,   50%  0%,   100% 5%,   100% 100%, 0% 100%)',
  ],
  tiltL: [
    'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    'polygon(0% 22%,  100% 46%,  100% 100%, 0% 100%)',
    'polygon(0% 0%,   100% 7%,   100% 100%, 0% 100%)',
  ],
  tiltR: [
    'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    'polygon(0% 46%,  100% 22%,  100% 100%, 0% 100%)',
    'polygon(0% 7%,   100% 0%,   100% 100%, 0% 100%)',
  ],
};

interface SectionRevealProps {
  children: ReactNode;
  wipe?: Wipe;
  marginTop?: string;
  /**
   * Background color of the incoming section.
   * Applied to the wrapper div so it pre-fills the space before the clip
   * reveals — eliminates gaps caused by the body background showing through
   * the previous section's bottom clip-path cut.
   */
  background: string;
}

const SectionReveal = ({
  children,
  wipe = 'up',
  marginTop = '-140px',
  background,
}: SectionRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.15'],
  });

  const [p0, p1, p2] = CLIPS[wipe];
  const clipPath = useTransform(scrollYProgress, [0, 0.5, 1], [p0, p1, p2]);

  return (
    // Wrapper fills with the section's own background color immediately,
    // so there is never a transparent gap showing through the previous
    // section's diagonal bottom cut.
    <div ref={ref} style={{ position: 'relative', marginTop, background }}>
      <motion.div style={{ clipPath }}>
        {children}
      </motion.div>
    </div>
  );
};

export default SectionReveal;
