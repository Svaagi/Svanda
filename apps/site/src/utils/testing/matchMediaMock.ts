type ChangeListener = (event: MediaQueryListEvent) => void;

// jsdom has no `matchMedia`; this stand-in lets specs flip a query and fire `change`.
export function createMatchMediaMock(initiallyMatching: string[] = []) {
  const matching = new Set(initiallyMatching);
  const listeners = new Map<string, Set<ChangeListener>>();

  const listenersFor = (query: string) => {
    const existing = listeners.get(query) ?? new Set<ChangeListener>();
    listeners.set(query, existing);
    return existing;
  };

  const matchMedia = (query: string) =>
    ({
      media: query,
      get matches() {
        return matching.has(query);
      },
      addEventListener: (_type: string, listener: ChangeListener) => {
        listenersFor(query).add(listener);
      },
      removeEventListener: (_type: string, listener: ChangeListener) => {
        listenersFor(query).delete(listener);
      },
    }) as unknown as MediaQueryList;

  const setMatches = (query: string, matches: boolean) => {
    if (matches) matching.add(query);
    else matching.delete(query);
    const event = { matches, media: query } as MediaQueryListEvent;
    listenersFor(query).forEach((listener) => listener(event));
  };

  const listenerCount = (query: string) => listenersFor(query).size;

  return { matchMedia, setMatches, listenerCount };
}
