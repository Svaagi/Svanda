import { LOCALE_STORAGE_KEY } from 'constants/locales';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { readRememberedLocale, rememberLocale } from './rememberedLocale';

describe('rememberedLocale', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('round-trips an explicit choice', () => {
    rememberLocale('sk');

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('sk');
    expect(readRememberedLocale()).toBe('sk');
  });

  it('ignores a missing or unsupported value', () => {
    expect(readRememberedLocale()).toBeNull();

    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');

    expect(readRememberedLocale()).toBeNull();
  });

  it('treats throwing storage as no choice', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readRememberedLocale()).toBeNull();
  });
});
