import type { Locale } from 'constants/locales';

import cs from './locales/cs.json';
import en from './locales/en.json';
import sk from './locales/sk.json';

// `_meta` carries notes for translators, not copy, so it never reaches i18next.
function withoutMeta<TCatalog extends object>({
  _meta: _translatorNotes,
  ...catalog
}: TCatalog & { _meta?: unknown }): Omit<TCatalog, '_meta'> {
  return catalog;
}

const referenceCatalog = withoutMeta(cs);

export type Catalog = typeof referenceCatalog;

export const catalogs: Record<Locale, Catalog> = {
  cs: referenceCatalog,
  en: withoutMeta(en),
  sk: withoutMeta(sk),
};
