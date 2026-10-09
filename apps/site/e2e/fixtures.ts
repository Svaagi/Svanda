import { type BrowserContext, test as base } from '@playwright/test';
import { INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE } from 'constants/intro';

import { mockContactChallenge } from './contactApiMock';

type StageFixtures = {
  // Whether the session has already seen the intro. Specs default to yes, so every page is
  // interactive at once; intro.spec.ts opts out to watch the intro itself.
  hasSeenIntro: boolean;
  // Headless browsers render WebGL in software, slow enough to stall paging and timing specs.
  // Specs default to no WebGL (the jukebox shows its poster); jukebox3d.spec.ts opts in.
  hasWebGL: boolean;
};

// For contexts a spec creates itself, which the fixture below does not reach.
export async function skipIntro(context: BrowserContext) {
  await context.addInitScript(
    ([key, value]) => window.sessionStorage.setItem(key, value),
    [INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE] as const,
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
  context: async ({ context, hasSeenIntro, hasWebGL }, provideContext) => {
    if (hasSeenIntro) await skipIntro(context);
    if (!hasWebGL) await disableWebGL(context);
    // The contact form fetches its challenge on every page; the preview has no API to answer.
    await mockContactChallenge(context);
    await provideContext(context);
  },
});

export { expect, type Page } from '@playwright/test';
