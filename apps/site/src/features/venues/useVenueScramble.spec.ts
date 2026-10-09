import { act, renderHook } from '@testing-library/react';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useVenueScramble } from './useVenueScramble';

const STEP_MS = 70;

const resolvedHead = (shown: string, text: string) => {
  let count = 0;
  while (count < text.length && shown[count] === text[count]) count += 1;
  return count;
};

describe('useVenueScramble', () => {
  let media: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    vi.useFakeTimers();
    // Never a letter of the names, so a resolved head is told apart from the scramble.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    media = createMatchMediaMock();
    vi.stubGlobal('matchMedia', media.matchMedia);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the first text as it is', () => {
    const { result } = renderHook(() => useVenueScramble('Lemon'));

    expect(result.current).toBe('Lemon');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('replays the scramble on every new text, two characters per 70 ms', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useVenueScramble(text),
      { initialProps: { text: 'Lemon' } },
    );

    rerender({ text: 'Arcade Bar' });
    expect(result.current).toBe('###### ###');

    const steps = [];
    for (let step = 0; step < 6; step++) {
      act(() => {
        vi.advanceTimersByTime(STEP_MS);
      });
      steps.push(result.current);
    }
    expect(steps).toEqual([
      'Ar#### ###',
      'Arca## ###',
      'Arcade ###',
      'Arcade B##',
      'Arcade Bar',
      'Arcade Bar',
    ]);
    expect(result.current).toBe('Arcade Bar');
    expect(vi.getTimerCount()).toBe(0);

    rerender({ text: 'Lemon' });
    expect(result.current).toBe('#####');
  });

  it('restarts from scratch when the text changes mid-scramble', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useVenueScramble(text),
      { initialProps: { text: 'Lemon' } },
    );
    rerender({ text: 'Arcade Bar' });
    act(() => {
      vi.advanceTimersByTime(STEP_MS * 2);
    });

    rerender({ text: 'Galerie Zlín' });
    expect(resolvedHead(result.current, 'Galerie Zlín')).toBe(0);
    act(() => {
      vi.advanceTimersByTime(STEP_MS);
    });
    expect(resolvedHead(result.current, 'Galerie Zlín')).toBe(2);
  });

  it('skips the scramble with reduced motion', () => {
    media.setMatches(REDUCED_MOTION_QUERY, true);
    const { result, rerender } = renderHook(
      ({ text }) => useVenueScramble(text),
      { initialProps: { text: 'Lemon' } },
    );

    rerender({ text: 'Arcade Bar' });
    expect(result.current).toBe('Arcade Bar');
    expect(vi.getTimerCount()).toBe(0);
  });
});
