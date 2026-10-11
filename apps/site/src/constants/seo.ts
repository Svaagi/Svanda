import type { Locale } from './locales';

// Imported by react-router.config.ts and app/ build helpers, so it keeps relative imports only.

export const SITE_ORIGIN = 'https://svanda.fun';

export const X_DEFAULT_HREFLANG = 'x-default';

export const OG_LOCALES: Readonly<Record<Locale, string>> = {
  cs: 'cs_CZ',
  en: 'en_US',
  sk: 'sk_SK',
};

export const OG_IMAGE_WIDTH_PX = 1200;
export const OG_IMAGE_HEIGHT_PX = 630;
export const OG_IMAGE_TYPE = 'image/png';

export function ogImagePath(locale: Locale): string {
  return `/images/og/svanda-${locale}.png`;
}

export const FAVICON_PATH = '/favicon.svg';
export const APPLE_TOUCH_ICON_PATH = '/apple-touch-icon.png';
export const APP_ICON_192_PATH = '/icon-192.png';
export const APP_ICON_512_PATH = '/icon-512.png';
export const MASKABLE_ICON_PATH = '/icon-maskable.svg';
export const MASKABLE_ICON_512_PATH = '/icon-maskable-512.png';
export const MANIFEST_PATH = '/manifest.webmanifest';

// The not-found page is prerendered once per locale for the host to serve on a 404; the
// splat route renders the same page for unknown links followed inside the app.
export const NOT_FOUND_PATHS: Readonly<Record<Locale, string>> = {
  cs: '/404',
  en: '/en/404',
  sk: '/sk/404',
};

export const NO_INDEX_ROBOTS = 'noindex, follow';

export const SITEMAP_FILE = 'sitemap.xml';
export const ROBOTS_FILE = 'robots.txt';
