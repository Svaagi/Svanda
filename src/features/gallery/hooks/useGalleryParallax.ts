import { RefObject } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';

export const useGalleryParallax = (
  sectionRef: RefObject<HTMLElement>,
  factor: number,
): MotionValue<string> => {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const shiftAmount = factor * 200;
  return useTransform(
    scrollYProgress,
    [0, 1],
    [`${shiftAmount}px`, `-${shiftAmount}px`],
  );
};
