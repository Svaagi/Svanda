import { afterEach, describe, expect, it, vi } from 'vitest';

import { readStorage, writeStorage } from './storage';

const KEY = 'svanda-test';

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('round-trips a value', () => {
    writeStorage(KEY, 'value');

    expect(readStorage(KEY)).toBe('value');
  });

  it('returns null for a missing key', () => {
    expect(readStorage(KEY)).toBeNull();
  });

  it('returns null when reading throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readStorage(KEY)).toBeNull();
  });

  it('swallows a throwing write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => writeStorage(KEY, 'value')).not.toThrow();
  });
});
