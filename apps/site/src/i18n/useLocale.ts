import type { Locale } from 'constants/locales';
import { useLocation } from 'react-router';

import { getLocaleFromPathname } from './localePath';

export function useLocale(): Locale {
  const { pathname } = useLocation();

  return getLocaleFromPathname(pathname);
}
