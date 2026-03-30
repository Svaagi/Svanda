import { RefObject, useEffect } from 'react';
import { MotionValue, useMotionValue } from 'framer-motion';

/**
 * Tracks scroll progress (0→1) of an element using getBoundingClientRect.
 * More reliable than useScroll({ target }) when large fixed/driver elements
 * precede the section in the DOM.
 */
export function useScrollProgress(ref: RefObject<HTMLElement>): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(
    function attachScrollListener() {
      const element = ref.current;
      if (!element) {
        return undefined;
      }

      function update() {
        const scrollable = element!.offsetHeight - window.innerHeight;
        if (scrollable <= 0) {
          return;
        }
        const rect = element!.getBoundingClientRect();
        progress.set(Math.max(0, Math.min(1, -rect.top / scrollable)));
      }

      window.addEventListener('scroll', update, { passive: true });
      update();

      return function cleanup() {
        window.removeEventListener('scroll', update);
      };
    },
    [progress, ref],
  );

  return progress;
}
