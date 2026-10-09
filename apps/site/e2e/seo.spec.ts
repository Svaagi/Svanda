import { LEGAL_LINKS } from 'constants/legal';
import { LOCALES } from 'constants/locales';
import {
  APP_ICON_512_PATH,
  APPLE_TOUCH_ICON_PATH,
  FAVICON_PATH,
  MANIFEST_PATH,
  NOT_FOUND_PATHS,
  ogImagePath,
  SITE_ORIGIN,
} from 'constants/seo';

import { expect, test } from './fixtures';

const HOME_PAGES = [
  { path: '/', locale: 'cs' },
  { path: '/en', locale: 'en' },
  { path: '/sk', locale: 'sk' },
] as const;
const LEGAL_PAGE_PATHS = LEGAL_LINKS.flatMap(({ paths }) =>
  LOCALES.map((locale) => paths[locale]),
);
const HTTP_OK = 200;

for (const { path, locale } of HOME_PAGES) {
  test(`prerenders the ${locale} head with SEO tags and structured data`, async ({
    request,
  }) => {
    const html = await (await request.get(path)).text();

    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    expect(html).toContain(
      `<link rel="canonical" href="${SITE_ORIGIN}${path === '/' ? '/' : path}"/>`,
    );
    for (const hreflang of [...LOCALES, 'x-default']) {
      expect(html).toContain(`hrefLang="${hreflang}"`);
    }
    expect(html).toContain(
      `<meta property="og:image" content="${SITE_ORIGIN}${ogImagePath(locale)}"/>`,
    );
    const jsonLd = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/s,
    )?.[1];
    const organization = JSON.parse(jsonLd ?? '{}');
    expect(organization['@type']).toBe('Organization');
    expect(organization.makesOffer.itemOffered['@type']).toBe('Product');
    expect(html).toContain('<noscript>');
  });
}

test('serves a sitemap of every prerendered page and a robots file', async ({
  request,
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of [
    ...HOME_PAGES.map(({ path }) => path),
    ...LEGAL_PAGE_PATHS,
  ]) {
    expect(sitemap).toContain(`<loc>${SITE_ORIGIN}${path}</loc>`);
    expect((await request.get(path)).status()).toBe(HTTP_OK);
  }
  expect(sitemap).not.toContain('404');

  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
});

test('serves the icons, manifest and Open Graph images', async ({
  request,
}) => {
  const assets = [
    FAVICON_PATH,
    APPLE_TOUCH_ICON_PATH,
    APP_ICON_512_PATH,
    MANIFEST_PATH,
    ...LOCALES.map(ogImagePath),
  ];
  for (const asset of assets) {
    expect((await request.get(asset)).status(), asset).toBe(HTTP_OK);
  }
});

for (const locale of LOCALES) {
  test(`prerenders the ${locale} not-found page outside the index`, async ({
    page,
    request,
  }) => {
    const path = NOT_FOUND_PATHS[locale];
    const html = await (await request.get(path)).text();
    expect(html).toContain('<meta name="robots" content="noindex, follow"/>');
    expect(html).not.toContain('rel="canonical"');

    await page.goto(path);
    await expect(page.getByTestId('not-found-page')).toHaveAttribute(
      'data-locale',
      locale,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  });
}

test('shows the not-found page for an unknown link inside the app', async ({
  page,
}) => {
  await page.goto('/en/legal');
  await page.evaluate(() => {
    window.history.pushState({}, '', '/en/no-such-page');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  await expect(page.getByTestId('not-found-page-title')).toHaveText(
    'Page not found',
  );
  await expect(page).toHaveTitle('Page not found | SVANDA');
});
