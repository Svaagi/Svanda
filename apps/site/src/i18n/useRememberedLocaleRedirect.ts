import { DEFAULT_LOCALE } from 'constants/locales';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { getLocalePath, isRootPath } from './localePath';
import { readRememberedLocale } from './rememberedLocale';

// A visit to `/` lands on the locale the visitor explicitly chose before. Only the first page
// of a visit is checked, so the back button can still return to `/` without bouncing.
export function useRememberedLocaleRedirect() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    if (!isRootPath(pathname)) return;

    const rememberedLocale = readRememberedLocale();
    if (!rememberedLocale || rememberedLocale === DEFAULT_LOCALE) return;

    // Navigation errors surface through the router; nothing here awaits the result.
    void navigate(
      { pathname: getLocalePath(rememberedLocale), hash },
      { replace: true },
    );
  }, [pathname, hash, navigate]);
}
