import { act, renderHook } from '@testing-library/react';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './useMediaQuery';

const NARROW = '(max-width: 900px)';
const WIDE = '(min-width: 901px)';

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(renderHook(() => useMediaQuery(NARROW)).result.current).toBe(false);
  });

  it('follows the query and moves its listener when the query changes', () => {
    const media = createMatchMediaMock([WIDE]);
    vi.stubGlobal('matchMedia', media.matchMedia);
    const { result, rerender, unmount } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: NARROW } },
    );

    expect(result.current).toBe(false);
    act(() => media.setMatches(NARROW, true));
    expect(result.current).toBe(true);

    rerender({ query: WIDE });
    expect(result.current).toBe(true);
    expect(media.listenerCount(NARROW)).toBe(0);
    expect(media.listenerCount(WIDE)).toBe(1);

    unmount();
    expect(media.listenerCount(WIDE)).toBe(0);
  });
});
