import { describe, expect, it } from 'vitest';

import { getLocaleFromPathname } from './localePath';

describe('getLocaleFromPathname', () => {
  it('reads the locale from the first path segment', () => {
    expect(getLocaleFromPathname('/en')).toBe('en');
    expect(getLocaleFromPathname('/sk/')).toBe('sk');
  });

  it('falls back to the default locale', () => {
    expect(getLocaleFromPathname('/')).toBe('cs');
    expect(getLocaleFromPathname('/unknown')).toBe('cs');
  });
});
