import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const SRC_DIR = fileURLToPath(new URL('./src', import.meta.url));
const SHARED_ENTRY = fileURLToPath(
  new URL('../../packages/shared/src/index.ts', import.meta.url),
);

// `resolve.tsconfigPaths` reads tsconfig.json, which excludes spec files, so specs would not
// see the `src` baseUrl. Mirror it here: one alias per top-level folder of `src`.
const srcAliases = readdirSync(SRC_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => ({
    find: new RegExp(`^${name}(?=/|$)`),
    replacement: join(SRC_DIR, name),
  }));

export default defineConfig({
  resolve: {
    alias: [
      ...srcAliases,
      { find: /^@svanda\/shared$/, replacement: SHARED_ENTRY },
    ],
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: [
      'app/**/*.spec.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'scripts/**/*.spec.ts',
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
