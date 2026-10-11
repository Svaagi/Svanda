// jsdom and very old engines have no `matchMedia`; treat that as "query does not match".
export function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(query);
}
