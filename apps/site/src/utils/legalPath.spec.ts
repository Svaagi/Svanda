import { LEGAL_LINKS } from 'constants/legal';
import { LOCALES } from 'constants/locales';
import { describe, expect, it } from 'vitest';

import { findLegalPageId, requireLegalPageId } from './legalPath';

describe('findLegalPageId', () => {
  it('finds every legal page by its path in every locale', () => {
    LEGAL_LINKS.forEach(({ id, paths }) => {
      LOCALES.forEach((locale) => {
        expect(findLegalPageId(paths[locale])).toBe(id);
      });
    });
  });

  it('ignores a trailing slash', () => {
    expect(findLegalPageId('/en/privacy/')).toBe('privacy');
  });

  it('finds nothing on other paths', () => {
    expect(findLegalPageId('/')).toBeUndefined();
    expect(findLegalPageId('/en')).toBeUndefined();
    expect(findLegalPageId('/en/privacy/more')).toBeUndefined();
  });
});

describe('requireLegalPageId', () => {
  it('returns the page or throws outside the legal routes', () => {
    expect(requireLegalPageId('/sk/zasady-cookies')).toBe('cookies');
    expect(() => requireLegalPageId('/missing')).toThrow('/missing');
  });
});
