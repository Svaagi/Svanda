import type { Locale } from 'constants/locales';
import { createInstance, type i18n } from 'i18next';

import { catalogs } from './catalogs';

const instances = new Map<Locale, i18n>();

function createLocaleInstance(locale: Locale): i18n {
  const instance = createInstance({
    lng: locale,
    fallbackLng: false,
    resources: { [locale]: { translation: catalogs[locale] } },
    // Resources are bundled, so init runs synchronously and prerendered HTML has real copy.
    initAsync: false,
    // React already escapes rendered text.
    interpolation: { escapeValue: false },
  });
  // Synchronous with `initAsync: false`; the returned promise carries nothing to wait for.
  void instance.init();

  return instance;
}

// One instance per locale (instead of `changeLanguage` on a shared one) keeps rendering pure:
// the locale in the URL alone decides which copy a render produces, on the server and client.
export function getI18nInstance(locale: Locale): i18n {
  let instance = instances.get(locale);
  if (!instance) {
    instance = createLocaleInstance(locale);
    instances.set(locale, instance);
  }

  return instance;
}
