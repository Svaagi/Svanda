import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { useSyncExternalStore } from 'react';
import { getMediaQueryList } from 'utils';

function subscribeReducedMotion(listener: () => void) {
  const query = getMediaQueryList(REDUCED_MOTION_QUERY);
  query?.addEventListener('change', listener);
  return () => query?.removeEventListener('change', listener);
}

function readReducedMotion(): boolean {
  return getMediaQueryList(REDUCED_MOTION_QUERY)?.matches ?? false;
}

// Prerendered HTML assumes full motion; the client corrects it right after hydration.
const getServerReducedMotion = (): boolean => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    getServerReducedMotion,
  );
}
