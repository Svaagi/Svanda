import { defineConfig, devices } from '@playwright/test';

// Matches the `preview` script, which serves the prerendered build like the production host.
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

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
    { name: 'webkit-mobile', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run preview',
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
  },
});
