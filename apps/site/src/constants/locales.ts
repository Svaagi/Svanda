export const LOCALES = ['cs', 'en', 'sk'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'cs';
