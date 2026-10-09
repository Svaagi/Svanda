import { LEGAL_LINKS } from 'constants/legal';
import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import { type Locale, LOCALES } from 'constants/locales';
import { NOT_FOUND_PATHS, SITE_ORIGIN } from 'constants/seo';
import type { MetaDescriptor } from 'react-router';
import { describe, expect, it } from 'vitest';

import { HOME_PATHS, homeMeta, legalMeta, notFoundMeta } from './routeMeta';

type PageGroup = {
  name: string;
  paths: Readonly<Record<Locale, string>>;
  meta: (pathname: string) => MetaDescriptor[];
};

const PAGE_GROUPS: PageGroup[] = [
  { name: 'home', paths: HOME_PATHS, meta: homeMeta },
  ...LEGAL_LINKS.map(({ id, paths }) => ({
    name: id,
    paths,
    meta: legalMeta,
  })),
];

function linksWithRel(meta: MetaDescriptor[], rel: string) {
  return meta.filter(
    (descriptor) => 'rel' in descriptor && descriptor.rel === rel,
  ) as { hrefLang?: string; href: string }[];
}

function contentOf(meta: MetaDescriptor[], key: string) {
  const descriptor = meta.find(
    (entry) =>
      ('name' in entry && entry.name === key) ||
      ('property' in entry && entry.property === key),
  );
  return descriptor && 'content' in descriptor ? descriptor.content : undefined;
}

type StructuredData = {
  '@type': string;
  makesOffer: { '@type': string; itemOffered: { '@type': string } };
};

function structuredData(meta: MetaDescriptor[]): StructuredData | undefined {
  for (const entry of meta) {
    if ('script:ld+json' in entry) {
      return entry['script:ld+json'] as StructuredData;
    }
  }
  return undefined;
}

describe('route meta', () => {
  PAGE_GROUPS.forEach(({ name, paths, meta }) => {
    LOCALES.forEach((locale) => {
      it(`gives the ${locale} ${name} page complete, reciprocal hreflang links`, () => {
        const descriptors = meta(paths[locale]);
        const alternates = linksWithRel(descriptors, 'alternate');

        expect(alternates.map(({ hrefLang }) => hrefLang)).toEqual([
          ...LOCALES,
          'x-default',
        ]);
        LOCALES.forEach((other) => {
          expect(alternates).toContainEqual(
            expect.objectContaining({
              hrefLang: other,
              href: `${SITE_ORIGIN}${paths[other]}`,
            }),
          );
        });
        expect(linksWithRel(descriptors, 'canonical')).toEqual([
          expect.objectContaining({ href: `${SITE_ORIGIN}${paths[locale]}` }),
        ]);
      });
    });
  });

  it('points each locale at its own Open Graph image and copy', () => {
    LOCALES.forEach((locale) => {
      const descriptors = homeMeta(HOME_PATHS[locale]);
      expect(contentOf(descriptors, 'og:image')).toContain(`-${locale}.png`);
      expect(contentOf(descriptors, 'description')).toBeTruthy();
    });
    expect(homeMeta('/en')).toContainEqual({
      title: 'SVANDA: the karaoke jukebox built from scratch',
    });
  });

  it('names the legal page in its title', () => {
    expect(legalMeta('/en/privacy')).toContainEqual({
      title: 'Privacy policy | SVANDA',
    });
  });

  it('describes the organization and the jukebox on the home page only', () => {
    const data = structuredData(homeMeta('/en'));

    expect(data?.['@type']).toBe('Organization');
    expect(data?.makesOffer['@type']).toBe('Offer');
    expect(data?.makesOffer.itemOffered['@type']).toBe('Product');
    expect(data).not.toHaveProperty('makesOffer.price');
    expect(JSON.stringify(data)).toContain(LEGAL_IDENTITY.ico);
    expect(JSON.stringify(data)).not.toMatch(/TODO/);
    expect(structuredData(legalMeta('/en/privacy'))).toBeUndefined();
  });

  it('keeps the not-found page out of the index', () => {
    LOCALES.forEach((locale) => {
      const descriptors = notFoundMeta(NOT_FOUND_PATHS[locale]);
      expect(contentOf(descriptors, 'robots')).toBe('noindex, follow');
      expect(linksWithRel(descriptors, 'canonical')).toEqual([]);
    });
  });
});
