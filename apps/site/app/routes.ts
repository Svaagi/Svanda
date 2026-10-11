import { index, route, type RouteConfig } from '@react-router/dev/routes';

import { LEGAL_LINKS } from '../src/constants/legal';
import { DEFAULT_LOCALE, LOCALES } from '../src/constants/locales';

const HOME_ROUTE_FILE = 'routes/home.tsx';
const LEGAL_ROUTE_FILE = 'routes/legal.tsx';
const NOT_FOUND_ROUTE_FILE = 'routes/notFound.tsx';
const SPLAT_PATH = '*';
const LEADING_SLASH = /^\//;

export default [
  index(HOME_ROUTE_FILE, { id: `home-${DEFAULT_LOCALE}` }),
  ...LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) =>
    route(locale, HOME_ROUTE_FILE, { id: `home-${locale}` }),
  ),
  ...LEGAL_LINKS.flatMap(({ id, paths }) =>
    LOCALES.map((locale) =>
      route(paths[locale].replace(LEADING_SLASH, ''), LEGAL_ROUTE_FILE, {
        id: `legal-${id}-${locale}`,
      }),
    ),
  ),
  route(SPLAT_PATH, NOT_FOUND_ROUTE_FILE, { id: 'not-found' }),
] satisfies RouteConfig;
