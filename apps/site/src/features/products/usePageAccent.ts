import { HERO_PAGE } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { useEffect } from 'react';

import { applyPageAccent, pageAccent } from './pageAccent';

// Follows the stage page and swaps the accent and cursor set on <html> in one place, so
// every element picks the colours up through the theme tokens.
export function usePageAccent() {
  const page = useStageStore((state) => state.page);

  useEffect(() => {
    const root = document.documentElement;
    applyPageAccent(root, pageAccent(page));
    return () => applyPageAccent(root, pageAccent(HERO_PAGE));
  }, [page]);
}
