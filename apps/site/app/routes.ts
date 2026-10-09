import { index, route, type RouteConfig } from '@react-router/dev/routes';

import { DEFAULT_LOCALE, LOCALES } from '../src/constants/locales';

const HOME_ROUTE_FILE = 'routes/home.tsx';

export default [
  index(HOME_ROUTE_FILE, { id: `home-${DEFAULT_LOCALE}` }),
  ...LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) =>
    route(locale, HOME_ROUTE_FILE, { id: `home-${locale}` }),
  ),
] satisfies RouteConfig;
