import type { ConsentCategory } from 'constants/consent';

import { useConsentStore } from './consentStore';

// False during prerender and until the consent manager has read the visitor's choice.
export function useConsent(category: ConsentCategory): boolean {
  return useConsentStore(({ acceptedCategories }) =>
    acceptedCategories.includes(category),
  );
}
