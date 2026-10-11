import { useEffect } from 'react';

import { useStageStore } from '../stageStore';
import { resolveScrollPage } from './pagingHelpers';

// The one scroll listener: maps the scroll position to the current page in the store.
export function useStageScroll() {
  useEffect(() => {
    const syncPage = () => {
      const { isReady, viewport, page, setPage } = useStageStore.getState();
      if (!isReady) return;
      const scrollPage = resolveScrollPage(window.scrollY, viewport.height);
      if (scrollPage !== page) setPage(scrollPage);
    };

    const unsubscribe = useStageStore.subscribe((state, previous) => {
      const hasBecomeReady = state.isReady && !previous.isReady;
      if (
        hasBecomeReady ||
        state.viewport.height !== previous.viewport.height
      ) {
        syncPage();
      }
    });
    window.addEventListener('scroll', syncPage, { passive: true });
    syncPage();

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', syncPage);
    };
  }, []);
}
