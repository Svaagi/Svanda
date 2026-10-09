import { type BrowserContext, test as base } from '@playwright/test';
import {
  CONSENT_COOKIE_DAYS,
  CONSENT_COOKIE_NAME,
  CONSENT_REVISION,
  type ConsentCategory,
} from 'constants/consent';
import { INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE } from 'constants/intro';

import { mockContactChallenge } from './contactApiMock';

const DAY_MS = 86_400_000;

type StageFixtures = {
  // Whether the session has already seen the intro. Specs default to yes, so every page is
  // interactive at once; intro.spec.ts opts out to watch the intro itself.
  hasSeenIntro: boolean;
  // Headless browsers render WebGL in software, slow enough to stall paging and timing specs.
  // Specs default to no WebGL (the jukebox shows its poster); jukebox3d.spec.ts opts in.
  hasWebGL: boolean;
  // The cookie banner would cover parts of every page, so specs default to a stored choice
  // (the defaults: necessary and analytics); consent.spec.ts opts out to see the banner.
  hasConsent: boolean;
};

// For contexts a spec creates itself, which the fixture below does not reach.
export async function skipIntro(context: BrowserContext) {
  await context.addInitScript(
    ([key, value]) => window.sessionStorage.setItem(key, value),
    [INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE] as const,
  );
}

// Stores a consent choice the way the consent manager does, unless the page already has one
// (a spec that changes the choice keeps it across reloads).
export async function presetConsent(
  context: BrowserContext,
  categories: readonly ConsentCategory[] = ['necessary', 'analytics'],
) {
  const timestamp = new Date().toISOString();
  const value = encodeURIComponent(
    JSON.stringify({
      categories,
      revision: CONSENT_REVISION,
      data: null,
      consentTimestamp: timestamp,
      consentId: 'e2e-consent',
      services: Object.fromEntries(
        categories.map((category) => [category, []]),
      ),
      languageCode: 'cs',
      lastConsentTimestamp: timestamp,
      expirationTime: Date.now() + CONSENT_COOKIE_DAYS * DAY_MS,
    }),
  );
  await context.addInitScript(
    ([name, cookieValue]) => {
      if (
        document.cookie
          .split('; ')
          .some((cookie) => cookie.startsWith(`${name}=`))
      )
        return;
      document.cookie = `${name}=${cookieValue}; Path=/; SameSite=Lax`;
    },
    [CONSENT_COOKIE_NAME, value] as const,
  );
}

// Makes every WebGL context request fail, as in a browser without WebGL.
export async function disableWebGL(context: BrowserContext) {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof getContext>
    ) {
      const [kind] = args;
      if (kind === 'webgl' || kind === 'webgl2') return null;
      return Reflect.apply(getContext, this, args) as ReturnType<
        typeof getContext
      >;
    } as typeof getContext;
  });
}

export const test = base.extend<StageFixtures>({
  hasSeenIntro: [true, { option: true }],
  hasWebGL: [false, { option: true }],
  hasConsent: [true, { option: true }],
  context: async (
    { context, hasSeenIntro, hasWebGL, hasConsent },
    provideContext,
  ) => {
    if (hasSeenIntro) await skipIntro(context);
    if (!hasWebGL) await disableWebGL(context);
    if (hasConsent) await presetConsent(context);
    // The contact form fetches its challenge on every page; the preview has no API to answer.
    await mockContactChallenge(context);
    await provideContext(context);
  },
});

export { expect, type Page } from '@playwright/test';
