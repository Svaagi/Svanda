import {
  CONSENT_CATEGORIES,
  CONSENT_COOKIE_DAYS,
  CONSENT_COOKIE_NAME,
  CONSENT_REVISION,
  type ConsentCategory,
} from 'constants/consent';
import { type Locale, LOCALES } from 'constants/locales';
import { getI18nInstance } from 'i18n';
import type { CookieConsentConfig, ModalName } from 'vanilla-cookieconsent';

import { buildConsentTranslation } from './consentTranslation';

type ConsentConfigOptions = {
  locale: Locale;
  onChoice: () => void;
  onModalReady: (modalName: ModalName, modal: HTMLElement) => void;
};

export function isConsentCategory(value: string): value is ConsentCategory {
  return CONSENT_CATEGORIES.some((category) => category === value);
}

export function buildConsentConfig({
  locale,
  onChoice,
  onModalReady,
}: ConsentConfigOptions): CookieConsentConfig {
  return {
    // Analytics is cookieless and runs on legitimate interest, so it is on until the visitor
    // objects; marketing stays off until they opt in.
    mode: 'opt-out',
    revision: CONSENT_REVISION,
    // The library treats every automated browser as a bot and would never show the banner
    // to the e2e suite; crawlers are not shown a different page either.
    hideFromBots: false,
    cookie: {
      name: CONSENT_COOKIE_NAME,
      expiresAfterDays: CONSENT_COOKIE_DAYS,
    },
    guiOptions: {
      // Equal weight: rejecting is as easy as accepting.
      consentModal: {
        layout: 'box',
        position: 'bottom right',
        equalWeightButtons: true,
      },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: { enabled: true },
      marketing: { enabled: false },
    },
    language: {
      default: locale,
      translations: Object.fromEntries(
        LOCALES.map((translationLocale) => [
          translationLocale,
          buildConsentTranslation(
            getI18nInstance(translationLocale).t,
            translationLocale,
          ),
        ]),
      ),
    },
    onConsent: onChoice,
    onChange: onChoice,
    onModalReady: ({ modalName, modal }) => onModalReady(modalName, modal),
  };
}
