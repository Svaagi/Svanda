import { LEGAL_LINKS } from 'constants/legal';
import { LOCALES } from 'constants/locales';
import { NOT_FOUND_PATHS } from 'constants/seo';
import { getLocalePath } from 'i18n';
import { describe, expect, it } from 'vitest';

import routes from './routes';
import {
  buildRobotsTxt,
  buildSitemapXml,
  listSitemapPaths,
  type SitemapRoute,
} from './seoFiles';

// The route manifest React Router builds from app/routes.ts: every route under the root.
const ROUTE_MANIFEST: Record<string, SitemapRoute> = Object.fromEntries([
  ['root', { id: 'root', path: '' }],
  ...routes.map(({ id = '', path, index }) => [
    id,
    { id, path, index, parentId: 'root' },
  ]),
]);

describe('sitemap', () => {
  it('lists every prerendered page route once', () => {
    const expected = [
      ...LOCALES.map(getLocalePath),
      ...LEGAL_LINKS.flatMap(({ paths }) =>
        LOCALES.map((locale) => paths[locale]),
      ),
    ];
    const paths = listSitemapPaths(ROUTE_MANIFEST);

    expect([...paths].sort()).toEqual([...expected].sort());
  });

  it('leaves out the splat route and the not-found pages', () => {
    const paths = listSitemapPaths(ROUTE_MANIFEST);

    expect(paths.some((path) => path.includes('*'))).toBe(false);
    Object.values(NOT_FOUND_PATHS).forEach((path) =>
      expect(paths).not.toContain(path),
    );
  });

  it('joins nested route paths', () => {
    expect(
      listSitemapPaths({
        root: { id: 'root', path: '' },
        layout: { id: 'layout', path: 'en', parentId: 'root' },
        page: { id: 'page', path: 'legal', parentId: 'layout' },
        user: { id: 'user', path: ':id', parentId: 'layout' },
      }),
    ).toEqual(['/en', '/en/legal']);
  });

  it('writes absolute URLs into a sitemap document', () => {
    const xml = buildSitemapXml(['/', '/en']);

    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain('<url><loc>https://svanda.fun/</loc></url>');
    expect(xml).toContain('<url><loc>https://svanda.fun/en</loc></url>');
  });

  it('points crawlers at the sitemap', () => {
    expect(buildRobotsTxt()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://svanda.fun/sitemap.xml\n',
    );
  });
});
