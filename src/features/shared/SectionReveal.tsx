import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

type Wipe = 'tiltRight' | 'vNotch' | 'tiltLeft' | 'wave' | 'stepRight' | 'zigzag' | 'tiltSimple';

const CLIPS: Record<Wipe, [string, string, string]> = {
  tiltRight: [
    'polygon(0% 0px, 100% 80px, 100% 80px, 0% 0px)',
    'polygon(0% 0px, 100% 80px, 100% 54%, 0% 50%)',
    'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
  vNotch: [
    'polygon(0% 100px, 50% 0px, 100% 70px, 100% 70px, 0% 100px)',
    'polygon(0% 100px, 50% 0px, 100% 70px, 100% 54%, 0% 50%)',
    'polygon(0% 0%, 50% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
  tiltLeft: [
    'polygon(0% 80px, 100% 0px, 100% 0px, 0% 80px)',
    'polygon(0% 80px, 100% 0px, 100% 50%, 0% 54%)',
    'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
  wave: [
    'polygon(0% 0px, 25% 70px, 60% 20px, 100% 90px, 100% 90px, 0% 0px)',
    'polygon(0% 0px, 25% 70px, 60% 20px, 100% 90px, 100% 56%, 0% 50%)',
    'polygon(0% 0%, 25% 0%, 60% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
  stepRight: [
    'polygon(0% 0px, 35% 60px, 100% 100px, 100% 100px, 0% 0px)',
    'polygon(0% 0px, 35% 60px, 100% 100px, 100% 57%, 0% 50%)',
    'polygon(0% 0%, 35% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
  zigzag: [
    'polygon(0% 60px, 33% 0px, 66% 60px, 100% 0px, 100% 0px, 0% 60px)',
    'polygon(0% 60px, 33% 0px, 66% 60px, 100% 0px, 100% 50%, 0% 54%)',
    'polygon(0% 0%, 33% 0%, 66% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
  tiltSimple: [
    'polygon(0% 90px, 100% 0px, 100% 0px, 0% 90px)',
    'polygon(0% 90px, 100% 0px, 100% 50%, 0% 56%)',
    'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ],
};

interface SectionRevealProps {
  children: ReactNode;
  wipe: Wipe;
  zIndex: number;
  marginTop?: string;
  endOffset?: number;
  parallaxY?: string;
  bgColor?: string;
}

const SectionReveal = ({
  children,
  wipe,
  zIndex,
  marginTop = '-200px',
  endOffset = 0.55,
  parallaxY = '8%',
  bgColor,
}: SectionRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress: enterProgress } = useScroll({
    target: ref,
    offset: ['start end', `start ${endOffset}`],
  });

  const { scrollYProgress: throughProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const ratcheted = useMotionValue(enterProgress.get());
  useMotionValueEvent(enterProgress, 'change', (v) => {
    if (v > ratcheted.get()) ratcheted.set(v);
  });

  const [p0, p1, p2] = CLIPS[wipe];
  const clipPath = useTransform(ratcheted, [0, 0.5, 1], [p0, p1, p2]);
  const y = useTransform(throughProgress, [0, 1], [`-${parallaxY}`, parallaxY]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', zIndex, marginTop, ...(bgColor ? { backgroundColor: bgColor } : {}) }}
    >
      <motion.div style={{ clipPath, y }}>
        {children}
      </motion.div>
    </div>
  );
};

export default SectionReveal;
