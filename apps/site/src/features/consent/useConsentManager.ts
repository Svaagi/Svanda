import { useLocale } from 'i18n';
import { useEffect } from 'react';

import { syncConsentManager } from './consentManager';

// Client only: the manager starts after hydration and follows the URL locale.
export function useConsentManager() {
  const locale = useLocale();

  useEffect(() => {
    syncConsentManager(locale);
  }, [locale]);
}
