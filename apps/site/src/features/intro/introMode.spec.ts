import { INTRO_SEEN_STORAGE_KEY } from 'constants/intro';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  hasSeenIntro,
  isOutsideStageHash,
  markIntroSeen,
  resolveIntroMode,
} from './introMode';

describe('resolveIntroMode', () => {
  it.each([
    { hasSeenIntro: false, isReducedMotion: false, mode: 'play' },
    { hasSeenIntro: true, isReducedMotion: false, mode: 'skip' },
    { hasSeenIntro: false, isReducedMotion: true, mode: 'skip' },
    { hasSeenIntro: true, isReducedMotion: true, mode: 'skip' },
  ])(
    'seen $hasSeenIntro, reduced motion $isReducedMotion: $mode',
    ({ mode, ...input }) => {
      expect(resolveIntroMode({ ...input, hash: '' })).toBe(mode);
    },
  );

  it.each([
    ['', 'play'],
    ['#top', 'play'],
    ['#venues', 'play'],
    ['#contact', 'skip'],
    ['#main', 'skip'],
  ])('with hash "%s": %s', (hash, mode) => {
    expect(
      resolveIntroMode({ hasSeenIntro: false, isReducedMotion: false, hash }),
    ).toBe(mode);
  });
});

describe('isOutsideStageHash', () => {
  it('treats no hash and a bare # as the stage', () => {
    expect(isOutsideStageHash('')).toBe(false);
    expect(isOutsideStageHash('#')).toBe(false);
  });
});

describe('intro seen flag', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('is unset on a fresh session and set once marked', () => {
    expect(hasSeenIntro()).toBe(false);

    markIntroSeen();

    expect(hasSeenIntro()).toBe(true);
    expect(
      window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY),
    ).not.toBeNull();
  });

  it('reads as unseen when session storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(hasSeenIntro()).toBe(false);
  });
});
