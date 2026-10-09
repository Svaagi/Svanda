import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMediaQueryList } from './mediaQuery';
import { createMatchMediaMock } from './testing';

const QUERY = '(pointer: fine)';

describe('getMediaQueryList', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(getMediaQueryList(QUERY)).toBeNull();
  });

  it('returns the query list when matchMedia exists', () => {
    vi.stubGlobal('matchMedia', createMatchMediaMock([QUERY]).matchMedia);

    expect(getMediaQueryList(QUERY)?.matches).toBe(true);
  });
});
