import { MOBILE_BREAKPOINT_PX } from 'constants/breakpoints';
import { type RefObject, useEffect } from 'react';

import { useStageStore } from './stageStore';
import type { StageViewport } from './stageTypes';

export function toStageViewport(width: number, height: number): StageViewport {
  return {
    width,
    height,
    isMobile: width < MOBILE_BREAKPOINT_PX,
    isPortrait: height > width,
  };
}

// Measures the sticky stage viewport (100svh) on mount and resize, never per frame. Its
// height is the page height that paging maths uses.
export function useStageViewport(viewportRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;

    const measure = () => {
      useStageStore
        .getState()
        .setViewport(
          toStageViewport(element.clientWidth, element.clientHeight),
        );
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [viewportRef]);
}
