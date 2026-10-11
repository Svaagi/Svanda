import { type Locale, LOCALE_STORAGE_KEY } from 'constants/locales';
import { readStorage, writeStorage } from 'utils';

import { isLocale } from './localePath';

export function readRememberedLocale(): Locale | null {
  const value = readStorage(LOCALE_STORAGE_KEY);

  return isLocale(value) ? value : null;
}

export function rememberLocale(locale: Locale): void {
  writeStorage(LOCALE_STORAGE_KEY, locale);
}
