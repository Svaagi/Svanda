import { DEFAULT_LOCALE, type Locale, LOCALES } from 'constants/locales';
import {
  NO_INDEX_ROBOTS,
  OG_IMAGE_HEIGHT_PX,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH_PX,
  OG_LOCALES,
  ogImagePath,
  SITE_ORIGIN,
  X_DEFAULT_HREFLANG,
} from 'constants/seo';
import type { MetaDescriptor } from 'react-router';

export type PageMetaInput = {
  locale: Locale;
  title: string;
  description: string;
  siteName: string;
  ogImageAlt: string;
  // The page's path in every locale; a page without them (the 404) is kept out of the index.
  alternatePaths?: Readonly<Record<Locale, string>>;
};

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

function alternateLinks(
  paths: Readonly<Record<Locale, string>>,
): MetaDescriptor[] {
  return [
    ...LOCALES.map((locale) => ({
      tagName: 'link',
      rel: 'alternate',
      hrefLang: locale,
      href: absoluteUrl(paths[locale]),
    })),
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: X_DEFAULT_HREFLANG,
      href: absoluteUrl(paths[DEFAULT_LOCALE]),
    },
  ];
}

function indexingMeta(
  locale: Locale,
  paths: Readonly<Record<Locale, string>> | undefined,
): MetaDescriptor[] {
  if (!paths) return [{ name: 'robots', content: NO_INDEX_ROBOTS }];

  return [
    { tagName: 'link', rel: 'canonical', href: absoluteUrl(paths[locale]) },
    ...alternateLinks(paths),
    { property: 'og:url', content: absoluteUrl(paths[locale]) },
  ];
}

function socialMeta({
  locale,
  title,
  description,
  siteName,
  ogImageAlt,
}: PageMetaInput): MetaDescriptor[] {
  const image = absoluteUrl(ogImagePath(locale));

  return [
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:locale', content: OG_LOCALES[locale] },
    ...LOCALES.filter((other) => other !== locale).map((other) => ({
      property: 'og:locale:alternate',
      content: OG_LOCALES[other],
    })),
    { property: 'og:image', content: image },
    { property: 'og:image:type', content: OG_IMAGE_TYPE },
    { property: 'og:image:width', content: String(OG_IMAGE_WIDTH_PX) },
    { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT_PX) },
    { property: 'og:image:alt', content: ogImageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: ogImageAlt },
  ];
}

export function buildPageMeta(input: PageMetaInput): MetaDescriptor[] {
  return [
    { title: input.title },
    { name: 'description', content: input.description },
    ...indexingMeta(input.locale, input.alternatePaths),
    ...socialMeta(input),
  ];
}
