import { describe, expect, it } from 'vitest';

import { absoluteUrl, buildPageMeta, type PageMetaInput } from './pageMeta';

const INPUT: PageMetaInput = {
  locale: 'en',
  title: 'Title',
  description: 'Description',
  siteName: 'SVANDA',
  ogImageAlt: 'Alt',
  alternatePaths: { cs: '/stranka', en: '/en/page', sk: '/sk/stranka' },
};

describe('buildPageMeta', () => {
  it('writes the title, description, canonical and social card', () => {
    const meta = buildPageMeta(INPUT);

    expect(meta).toContainEqual({ title: 'Title' });
    expect(meta).toContainEqual({
      name: 'description',
      content: 'Description',
    });
    expect(meta).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: 'https://svanda.fun/en/page',
    });
    expect(meta).toContainEqual({ property: 'og:locale', content: 'en_US' });
    expect(meta).toContainEqual({
      property: 'og:image',
      content: 'https://svanda.fun/images/og/svanda-en.png',
    });
    expect(meta).toContainEqual({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    expect(meta).not.toContainEqual(
      expect.objectContaining({ name: 'robots' }),
    );
  });

  it('links every locale and points x-default at Czech', () => {
    const alternates = buildPageMeta(INPUT).filter(
      (descriptor) => 'rel' in descriptor && descriptor.rel === 'alternate',
    );

    expect(alternates).toEqual([
      expect.objectContaining({
        hrefLang: 'cs',
        href: absoluteUrl('/stranka'),
      }),
      expect.objectContaining({
        hrefLang: 'en',
        href: absoluteUrl('/en/page'),
      }),
      expect.objectContaining({
        hrefLang: 'sk',
        href: absoluteUrl('/sk/stranka'),
      }),
      expect.objectContaining({
        hrefLang: 'x-default',
        href: absoluteUrl('/stranka'),
      }),
    ]);
  });

  it('keeps a page without alternates out of the index', () => {
    const meta = buildPageMeta({ ...INPUT, alternatePaths: undefined });

    expect(meta).toContainEqual({ name: 'robots', content: 'noindex, follow' });
    expect(meta).not.toContainEqual(
      expect.objectContaining({ rel: 'canonical' }),
    );
    expect(meta).not.toContainEqual(
      expect.objectContaining({ rel: 'alternate' }),
    );
  });
});
