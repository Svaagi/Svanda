import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROBOTS_FILE, SITE_ORIGIN, SITEMAP_FILE } from '../src/constants/seo';

// The fields of React Router's route manifest the sitemap needs.
export type SitemapRoute = {
  id: string;
  parentId?: string;
  path?: string;
  index?: boolean;
};

const DYNAMIC_SEGMENT = /[:*]/;
const ROOT_PATH = '/';

function fullPath(
  route: SitemapRoute,
  routes: Readonly<Record<string, SitemapRoute>>,
): string {
  const segments: string[] = [];
  for (
    let current: SitemapRoute | undefined = route;
    current;
    current = current.parentId ? routes[current.parentId] : undefined
  ) {
    if (current.path) segments.unshift(current.path);
  }

  return `${ROOT_PATH}${segments.join('/')}`;
}

// Every page route with a static path, which is exactly what `prerender: true` renders.
// Layout routes (the root) and splat or parameter routes are not pages of their own.
export function listSitemapPaths(
  routes: Readonly<Record<string, SitemapRoute>>,
): string[] {
  const paths = Object.values(routes)
    .filter((route) => route.index || (route.path && route.parentId))
    .map((route) => fullPath(route, routes))
    .filter((path) => !DYNAMIC_SEGMENT.test(path));

  return [...new Set(paths)];
}

export function buildSitemapXml(paths: readonly string[]): string {
  const urls = paths
    .map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/${SITEMAP_FILE}
`;
}

export function writeSeoFiles(
  clientDirectory: string,
  routes: Readonly<Record<string, SitemapRoute>>,
): void {
  writeFileSync(
    join(clientDirectory, SITEMAP_FILE),
    buildSitemapXml(listSitemapPaths(routes)),
  );
  writeFileSync(join(clientDirectory, ROBOTS_FILE), buildRobotsTxt());
}
