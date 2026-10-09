import { LEGAL_PATHS } from 'constants/legal';
import { type Locale, LOCALES } from 'constants/locales';
import { getI18nInstance, getLocaleFromPathname, getLocalePath } from 'i18n';
import type { TFunction } from 'i18next';
import type { MetaDescriptor } from 'react-router';
import { requireLegalPageId } from 'utils';

import { buildPageMeta } from './pageMeta';
import { buildStructuredData } from './structuredData';

export const HOME_PATHS = Object.fromEntries(
  LOCALES.map((locale) => [locale, getLocalePath(locale)]),
) as Record<Locale, string>;

// Meta functions run outside React, so they read the copy straight from the locale's
// i18n instance, the same one the page renders with.
function pageContext(pathname: string) {
  const locale = getLocaleFromPathname(pathname);
  const { t } = getI18nInstance(locale);

  return {
    t,
    shared: {
      locale,
      siteName: t('brand.name'),
      ogImageAlt: t('seo.ogImageAlt'),
    },
  };
}

function pageTitle(t: TFunction, page: string): string {
  return t('seo.pageTitle', { page });
}

export function homeMeta(pathname: string): MetaDescriptor[] {
  const { t, shared } = pageContext(pathname);

  return [
    ...buildPageMeta({
      ...shared,
      title: t('seo.home.title'),
      description: t('seo.home.description'),
      alternatePaths: HOME_PATHS,
    }),
    { 'script:ld+json': buildStructuredData(shared.locale, t) },
  ];
}

export function legalMeta(pathname: string): MetaDescriptor[] {
  const { t, shared } = pageContext(pathname);
  const pageId = requireLegalPageId(pathname);

  return buildPageMeta({
    ...shared,
    title: pageTitle(t, t(`footer.${pageId}`)),
    description: t(`seo.legal.${pageId}`),
    alternatePaths: LEGAL_PATHS[pageId],
  });
}

export function notFoundMeta(pathname: string): MetaDescriptor[] {
  const { t, shared } = pageContext(pathname);

  return buildPageMeta({
    ...shared,
    title: pageTitle(t, t('notFound.title')),
    description: t('seo.notFound'),
  });
}
