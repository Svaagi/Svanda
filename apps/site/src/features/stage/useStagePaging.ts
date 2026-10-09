import { useReducedMotion } from 'hooks';
import type { RefObject } from 'react';

import {
  useGoToPage,
  useKeyboardPaging,
  useStageScroll,
  useVpTween,
  useWheelPaging,
} from './paging';
import { useStageViewport } from './useStageViewport';

// Order matters: effects run in call order, so the viewport is measured before the first
// scroll sync, and the page is known before the tween lands on it.
export function useStagePaging(viewportRef: RefObject<HTMLElement | null>) {
  const isReducedMotion = useReducedMotion();
  const goToPage = useGoToPage();

  useStageViewport(viewportRef);
  useStageScroll();
  useVpTween(isReducedMotion);
  useWheelPaging(goToPage);
  useKeyboardPaging(goToPage);
}
