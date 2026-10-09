import { act, renderHook } from '@testing-library/react';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(renderHook(() => useReducedMotion()).result.current).toBe(false);
  });

  it('reflects the current preference', () => {
    vi.stubGlobal(
      'matchMedia',
      createMatchMediaMock([REDUCED_MOTION_QUERY]).matchMedia,
    );

    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
  });

  it('updates when the preference changes and cleans up on unmount', () => {
    const media = createMatchMediaMock();
    vi.stubGlobal('matchMedia', media.matchMedia);
    const { result, unmount } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
    act(() => media.setMatches(REDUCED_MOTION_QUERY, true));
    expect(result.current).toBe(true);

    unmount();
    expect(media.listenerCount(REDUCED_MOTION_QUERY)).toBe(0);
  });
});
