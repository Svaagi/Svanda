import { useEffect } from 'react';

import { useStageStore } from '../stageStore';
import { isPagingKeyTarget, resolveKeyPage } from './keyboardPaging';
import { isNativeContactScroll, resolveScrollPage } from './pagingHelpers';

const hasModifier = (event: KeyboardEvent) =>
  event.altKey || event.ctrlKey || event.metaKey;

export function useKeyboardPaging(goToPage: (page: number) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || hasModifier(event)) return;
      if (!isPagingKeyTarget(event.target, event.key)) return;

      const { isReady, viewport } = useStageStore.getState();
      const { scrollY } = window;
      const currentPage = resolveScrollPage(scrollY, viewport.height);
      const page = resolveKeyPage(event, currentPage);
      if (page === null || page === currentPage) return;
      if (isNativeContactScroll(scrollY, viewport.height, page - currentPage)) {
        return;
      }

      event.preventDefault();
      // A held key repeats: one press turns one page.
      if (!isReady || event.repeat) return;
      goToPage(page);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPage]);
}
