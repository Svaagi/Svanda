import { type BrowserContext, test as base } from '@playwright/test';
import { INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE } from 'constants/intro';

type IntroFixtures = {
  // Whether the session has already seen the intro. Specs default to yes, so every page is
  // interactive at once; intro.spec.ts opts out to watch the intro itself.
  hasSeenIntro: boolean;
};

// For contexts a spec creates itself, which the fixture below does not reach.
export async function skipIntro(context: BrowserContext) {
  await context.addInitScript(
    ([key, value]) => window.sessionStorage.setItem(key, value),
    [INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE] as const,
  );
}

export const test = base.extend<IntroFixtures>({
  hasSeenIntro: [true, { option: true }],
  context: async ({ context, hasSeenIntro }, provideContext) => {
    if (hasSeenIntro) await skipIntro(context);
    await provideContext(context);
  },
});

export { expect, type Page } from '@playwright/test';
