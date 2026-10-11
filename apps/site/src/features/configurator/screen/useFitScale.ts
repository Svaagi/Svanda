import { type RefObject, useEffect, useState } from 'react';

import { fitScale } from './flatScreen';

type BoxSize = { width: number; height: number };

// How far a box of `screen` size must scale to fit whole inside the element, kept up to
// date as the element resizes.
export function useFitScale(
  containerRef: RefObject<HTMLElement | null>,
  screen: BoxSize,
): number {
  const [scale, setScale] = useState(0);
  const { width, height } = screen;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const measure = () =>
      setScale(
        fitScale(
          { width: container.clientWidth, height: container.clientHeight },
          { width, height },
        ),
      );
    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    observer?.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef, width, height]);

  return scale;
}
