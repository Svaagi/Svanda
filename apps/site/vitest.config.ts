import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';
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

// Specs skip vite-imagetools (sharp in every worker is slow): an `as=picture` import becomes
// a stub picture pointing at its source file.
const STUB_PICTURE_SIZE = { w: 1600, h: 1200 };
const pictureStub: Plugin = {
  name: 'picture-stub',
  enforce: 'pre',
  load(id) {
    if (!/[?&]as=picture/.test(id)) return null;
    const src = id.slice(0, id.indexOf('?'));
    const picture = {
      sources: { avif: `${src}.avif` },
      img: { src, ...STUB_PICTURE_SIZE },
    };
    return `export default ${JSON.stringify(picture)};`;
  },
};

export default defineConfig({
  plugins: [pictureStub],
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
