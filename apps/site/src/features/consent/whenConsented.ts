import type { ConsentCategory } from 'constants/consent';

import { isConsented, useConsentStore } from './consentStore';

// Runs `load` once, as soon as the category is consented to (at once if it already is).
// The only way a script that needs consent may be loaded. Returns a cancel function.
export function whenConsented(
  category: ConsentCategory,
  load: () => void,
): () => void {
  if (isConsented(category)) {
    load();
    return () => {};
  }

  const unsubscribe = useConsentStore.subscribe(({ acceptedCategories }) => {
    if (!acceptedCategories.includes(category)) return;
    unsubscribe();
    load();
  });

  return unsubscribe;
}
