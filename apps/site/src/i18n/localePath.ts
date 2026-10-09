import { DEFAULT_LOCALE, type Locale, LOCALES } from 'constants/locales';

function isLocale(segment: string | undefined): segment is Locale {
  return LOCALES.some((locale) => locale === segment);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const [firstSegment] = pathname.split('/').filter(Boolean);

  return isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
}
