import 'i18next';

import type { Catalog } from './catalogs';

// Typed keys: `t('nav.contact')` compiles, a key missing from the cs catalog does not.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Catalog };
  }
}
