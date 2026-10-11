import { type MouseEvent, useCallback } from 'react';
import { isPlainLeftClick } from 'utils';

// A plain click pages the stage instead of jumping to the anchor; modified clicks keep the
// browser behaviour so the link still opens in a new tab.
export function usePageLinkClick(
  page: number,
  onNavigate: (page: number) => void,
) {
  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(event)) return;
      event.preventDefault();
      onNavigate(page);
    },
    [page, onNavigate],
  );
}
