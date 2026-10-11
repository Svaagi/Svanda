import { DEFAULT_LOCALE, type Locale, LOCALES } from 'constants/locales';

const ROOT_PATH = '/';

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const [firstSegment] = pathname.split('/').filter(Boolean);

  return isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
}

export function getLocalePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? ROOT_PATH : `${ROOT_PATH}${locale}`;
}

export function isRootPath(pathname: string): boolean {
  return pathname === ROOT_PATH;
}
