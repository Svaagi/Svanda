import { ReactNode } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

export type TransitionType = 'tiltLeft' | 'tiltRight' | 'swordLeft' | 'archBottom';

interface ClipWipe {
  from: string;
  to: string;
}

const WIPES: Record<TransitionType, ClipWipe> = {
  // Straight diagonal — right edge retreats first.
  tiltLeft: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100% -14%, 0%   0%)',
  },
  // Mirrored diagonal — left edge retreats first.
  tiltRight: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%   0%, 0% -14%)',
  },
  // Near-horizontal slice — thin sword-like exit.
  swordLeft: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%  -8%, 0%   0%)',
  },
  // Arch curves up from bottom center.
  archBottom: {
    from: 'polygon(0% 0%, 100% 0%, 100% 100%, 75% 100%, 50% 100%, 25% 100%, 0% 100%)',
    to:   'polygon(0% 0%, 100% 0%, 100%   0%, 75%  18%, 50%  25%, 25%  18%, 0%   0%)',
  },
};

interface SectionRevealProps {
  children?: ReactNode;
  zIndex: number;
  scrollYProgress: MotionValue<number>;
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
  const safeRange: [number, number] = scrollRange ?? [1, 1.01];
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
