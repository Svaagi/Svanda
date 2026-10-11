import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// False in the prerendered HTML and during hydration, true once React runs the page.
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
