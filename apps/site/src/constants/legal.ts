import type { Locale } from './locales';

export type LegalLinkId = 'imprint' | 'privacy' | 'cookies';

export type LegalLink = {
  id: LegalLinkId;
  paths: Record<Locale, string>;
};

// The legal pages arrive later; until then these links lead nowhere.
export const LEGAL_LINKS: readonly LegalLink[] = [
  {
    id: 'imprint',
    paths: {
      cs: '/pravni-informace',
      en: '/en/legal',
      sk: '/sk/pravne-informacie',
    },
  },
  {
    id: 'privacy',
    paths: {
      cs: '/ochrana-osobnich-udaju',
      en: '/en/privacy',
      sk: '/sk/ochrana-osobnych-udajov',
    },
  },
  {
    id: 'cookies',
    paths: {
      cs: '/zasady-cookies',
      en: '/en/cookies',
      sk: '/sk/zasady-cookies',
    },
  },
];

export const COPYRIGHT_YEAR = 2026;
