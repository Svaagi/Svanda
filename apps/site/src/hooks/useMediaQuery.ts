import { useCallback, useSyncExternalStore } from 'react';
import { getMediaQueryList } from 'utils';

// Prerendered HTML knows no viewport: it renders as if the query does not match, and the
// client corrects it right after hydration.
const getServerMatches = (): boolean => false;

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (listener: () => void) => {
      const queryList = getMediaQueryList(query);
      queryList?.addEventListener('change', listener);
      return () => queryList?.removeEventListener('change', listener);
    },
    [query],
  );
  const getMatches = useCallback(
    () => getMediaQueryList(query)?.matches ?? false,
    [query],
  );

  return useSyncExternalStore(subscribe, getMatches, getServerMatches);
}
