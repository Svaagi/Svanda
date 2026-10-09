import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Specs run against the shared package source, so they need no build of it first.
const SHARED_ENTRY = fileURLToPath(
  new URL('../../packages/shared/src/index.ts', import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: [{ find: /^@svanda\/shared$/, replacement: SHARED_ENTRY }],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
