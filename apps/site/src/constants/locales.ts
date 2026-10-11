export const LOCALES = ['cs', 'en', 'sk'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'cs';

// Holds only an explicit choice made in the language switch, never a detected language.
export const LOCALE_STORAGE_KEY = 'svanda-lang';
