import { defineConfig, devices } from '@playwright/test';

// Matches the `preview` script, which serves the prerendered build like the production host.
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
// WebKit under heavy parallel load can stall a client-side locale switch past the assertion
// timeout (reproduced on the base commit with 8 parallel WebKit workers, never serially), so
// the WebKit project runs on fewer workers than Chromium.
const WEBKIT_WORKERS = 4;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  // An HTML report is uploaded as a CI artifact when a run fails.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 2 : 0,
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
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
  },
});
