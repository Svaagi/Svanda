import { defineConfig, devices } from '@playwright/test';

import { E2E_UMAMI_WEBSITE_ID, UMAMI_SCRIPT_URL } from './e2e/umamiMock';

// Matches the `preview` script, which serves the prerendered build like the production host.
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
// WebKit under heavy parallel load can stall a client-side locale switch past the assertion
// timeout (reproduced on the base commit with 8 parallel WebKit workers, never serially), so
// the WebKit project runs on fewer workers than Chromium. It binds in CI; locally the lower
// global cap below applies.
const WEBKIT_WORKERS = 4;
// Locally the default (half the cores) starves the preview server and WebKit, so unrelated
// specs time out at random (on the base commit too).
const LOCAL_WORKERS = 2;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  // An HTML report is uploaded as a CI artifact when a run fails.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? undefined : LOCAL_WORKERS,
  use: {
    baseURL: PREVIEW_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 15'] },
      workers: WEBKIT_WORKERS,
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run preview',
    // A production build with a tracker, as deployed; the fixtures stub its script.
    env: {
      VITE_UMAMI_WEBSITE_ID: E2E_UMAMI_WEBSITE_ID,
      VITE_UMAMI_SRC: UMAMI_SCRIPT_URL,
    },
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
  },
});
