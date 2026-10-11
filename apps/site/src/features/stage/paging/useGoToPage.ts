import { useReducedMotion } from 'hooks';
import { useCallback } from 'react';

import { useStageStore } from '../stageStore';
import { pageScrollTop } from './pagingHelpers';

// Scrolls to a page's snap anchor; the scroll listener then updates the page and the tween.
export function useGoToPage(): (page: number) => void {
  const isReducedMotion = useReducedMotion();

  return useCallback(
    (page: number) => {
      const { height } = useStageStore.getState().viewport;
      window.scrollTo({
        top: pageScrollTop(page, height),
        behavior: isReducedMotion ? 'instant' : 'smooth',
      });
    },
    [isReducedMotion],
  );
}
