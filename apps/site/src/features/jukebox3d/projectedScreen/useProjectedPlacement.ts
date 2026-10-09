import { type StageState, useStageStore } from 'features/stage';
import { type RefObject, useEffect } from 'react';

import { projectedPlacement } from './projectedDisplay';

function applyPlacement(element: HTMLElement, { vp, screenQuad }: StageState) {
  const { opacity, transform } = projectedPlacement(vp, screenQuad);
  element.style.opacity = String(opacity);
  if (transform) element.style.transform = transform;
}

// Keeps the element warped onto the 3D display. The quad changes on every moving scene frame,
// so the style is written straight to the element instead of re-rendering the screen content.
export function useProjectedPlacement(
  elementRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    applyPlacement(element, useStageStore.getState());
    return useStageStore.subscribe((state, previous) => {
      if (
        state.vp !== previous.vp ||
        state.screenQuad !== previous.screenQuad
      ) {
        applyPlacement(element, state);
      }
    });
  }, [elementRef]);
}
