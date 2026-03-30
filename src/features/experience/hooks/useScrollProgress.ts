import { RefObject, useLayoutEffect } from 'react';
import { MotionValue, useMotionValue } from 'framer-motion';

/**
 * Returns a MotionValue (0→1) tracking how far the user has scrolled
 * through the target element.  Uses a raw scroll listener driven by
 * Framer Motion's scheduler so derived useTransform values update in sync.
 */
export function useScrollProgress(ref: RefObject<HTMLElement>): MotionValue<number> {
  const progress = useMotionValue(0);

  useLayoutEffect(
    function attachScrollListener() {
      function update() {
        const element = ref.current;
        if (!element) return;

        const scrollable = element.offsetHeight - window.innerHeight;
        if (scrollable < 1) return;

        const rect = element.getBoundingClientRect();
        const raw  = -rect.top / scrollable;
        progress.set(Math.min(1, Math.max(0, raw)));
      }

      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });

      return function cleanup() {
        window.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
      };
    },
    // progress and ref are stable refs — effect runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return progress;
}
