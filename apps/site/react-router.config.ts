import { join } from 'node:path';

import type { Config } from '@react-router/dev/config';

import { writeSeoFiles } from './app/seoFiles';
import { NOT_FOUND_PATHS } from './src/constants/seo';

const CLIENT_BUILD_DIR = 'client';

export default {
  ssr: false,
  // Every static route, plus the not-found page per locale (matched by the splat route) for
  // the host to serve on a 404.
  prerender: ({ getStaticPaths }) => [
    ...getStaticPaths(),
    ...Object.values(NOT_FOUND_PATHS),
  ],
  buildEnd: ({ reactRouterConfig }) => {
    writeSeoFiles(
      join(reactRouterConfig.buildDirectory, CLIENT_BUILD_DIR),
      reactRouterConfig.routes,
    );
  },
} satisfies Config;
