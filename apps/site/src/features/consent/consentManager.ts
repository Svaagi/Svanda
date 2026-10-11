import type { Locale } from 'constants/locales';

import { buildConsentConfig, isConsentCategory } from './consentConfig';
import { tagConsentModal } from './consentModalTestIds';
import { useConsentStore } from './consentStore';
import type { CookieConsentApi } from './cookieConsentClient';

let consentManager: Promise<CookieConsentApi> | null = null;

function publishAcceptedCategories(api: CookieConsentApi) {
  const { acceptedCategories } = api.getUserPreferences();
  useConsentStore
    .getState()
    .setAcceptedCategories(acceptedCategories.filter(isConsentCategory));
}

async function startConsentManager(locale: Locale): Promise<CookieConsentApi> {
  const { CookieConsent } = await import('./cookieConsentClient');
  await CookieConsent.run(
    buildConsentConfig({
      locale,
      onChoice: () => publishAcceptedCategories(CookieConsent),
      onModalReady: tagConsentModal,
    }),
  );
  // Before the first choice no consent callback fires, yet the defaults already apply.
  publishAcceptedCategories(CookieConsent);

  return CookieConsent;
}

export function syncConsentManager(locale: Locale) {
  if (!consentManager) {
    const started = startConsentManager(locale);
    consentManager = started;
    // A failed chunk load or run leaves no manager, so the next call retries.
    started.catch(() => {
      if (consentManager === started) consentManager = null;
    });
    return;
  }
  // Fire and forget: the switch completes in the library; a failed start is handled above.
  consentManager.then((api) => api.setLanguage(locale)).catch(() => {});
}

export function openCookieSettings() {
  // Fire and forget: the preferences open once the manager has started, if it does.
  consentManager?.then((api) => api.showPreferences()).catch(() => {});
}
