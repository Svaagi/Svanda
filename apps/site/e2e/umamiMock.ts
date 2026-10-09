import type { BrowserContext, Page } from '@playwright/test';

import { UMAMI_DEFAULT_SRC } from '../src/constants/analytics';

// The e2e preview is built with these (see playwright.config.ts), so it loads the tracker like
// production; the fixtures answer the script request with a recording stub.
export const E2E_UMAMI_WEBSITE_ID = 'e2e-website';
export const UMAMI_SCRIPT_URL = UMAMI_DEFAULT_SRC;

export type UmamiCall = {
  url?: string;
  name?: string;
  data?: Record<string, unknown>;
};

const TRACKER_STUB = `
window.__umamiCalls = [];
window.umami = {
  track(buildPayload) {
    window.__umamiCalls.push(buildPayload({ website: '${E2E_UMAMI_WEBSITE_ID}' }));
  },
};
`;

export async function mockUmami(context: BrowserContext) {
  await context.route(UMAMI_SCRIPT_URL, (route) =>
    route.fulfill({ contentType: 'text/javascript', body: TRACKER_STUB }),
  );
}

// Every call the page made to the tracker, or null while the tracker has not loaded.
export const readUmamiCalls = (page: Page) =>
  page.evaluate(
    () =>
      (window as Window & { __umamiCalls?: UmamiCall[] }).__umamiCalls ?? null,
  );

export async function readUmamiEvents(page: Page, name: string) {
  return ((await readUmamiCalls(page)) ?? []).filter(
    (call) => call.name === name,
  );
}

export async function readPageViews(page: Page) {
  return ((await readUmamiCalls(page)) ?? []).filter(
    (call) => call.name === undefined,
  );
}
