import type { ConsentCategory } from 'constants/consent';
import { create } from 'zustand';

type ConsentState = {
  // Empty until the consent manager runs in the browser, so nothing gated loads during
  // prerender, hydration or before the visitor's stored choice is read.
  acceptedCategories: readonly ConsentCategory[];
  setAcceptedCategories: (categories: readonly ConsentCategory[]) => void;
};

export const useConsentStore = create<ConsentState>()((set) => ({
  acceptedCategories: [],
  setAcceptedCategories: (acceptedCategories) => set({ acceptedCategories }),
}));

export function isConsented(category: ConsentCategory): boolean {
  return useConsentStore.getState().acceptedCategories.includes(category);
}
