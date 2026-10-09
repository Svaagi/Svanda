import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  readSessionStorage,
  readStorage,
  removeStorage,
  writeSessionStorage,
  writeStorage,
} from './storage';

const KEY = 'svanda-test';

const AREAS = [
  {
    name: 'localStorage',
    read: readStorage,
    write: writeStorage,
    storage: () => window.localStorage,
  },
  {
    name: 'sessionStorage',
    read: readSessionStorage,
    write: writeSessionStorage,
    storage: () => window.sessionStorage,
  },
];

describe.each(AREAS)('$name', ({ read, write, storage }) => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('round-trips a value in its own area only', () => {
    write(KEY, 'value');

    expect(read(KEY)).toBe('value');
    expect(storage().getItem(KEY)).toBe('value');
    const otherArea =
      storage() === window.localStorage
        ? window.sessionStorage
        : window.localStorage;
    expect(otherArea.getItem(KEY)).toBeNull();
  });

  it('returns null for a missing key', () => {
    expect(read(KEY)).toBeNull();
  });

  it('returns null when reading throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(read(KEY)).toBeNull();
  });

  it('swallows a throwing write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => write(KEY, 'value')).not.toThrow();
  });
});

describe('removeStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('removes a stored value', () => {
    writeStorage(KEY, 'value');
    removeStorage(KEY);

    expect(readStorage(KEY)).toBeNull();
  });

  it('swallows a throwing remove', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => removeStorage(KEY)).not.toThrow();
  });
});
