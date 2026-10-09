import { describe, expect, it } from 'vitest';

import {
  getLocaleFromPathname,
  getLocalePath,
  isLocale,
  isRootPath,
} from './localePath';

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

describe('getLocalePath', () => {
  it('serves the default locale at the root and the others under their code', () => {
    expect(getLocalePath('cs')).toBe('/');
    expect(getLocalePath('en')).toBe('/en');
    expect(getLocalePath('sk')).toBe('/sk');
  });
});

describe('isLocale', () => {
  it('accepts only supported locale codes', () => {
    expect(isLocale('sk')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe('isRootPath', () => {
  it('matches only the site root', () => {
    expect(isRootPath('/')).toBe(true);
    expect(isRootPath('/en')).toBe(false);
  });
});
