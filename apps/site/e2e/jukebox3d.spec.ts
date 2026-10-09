type WebGLCounts = { live: number; created: number };

declare global {
  interface Window {
    readWebGLCounts?: () => WebGLCounts;
  }
}

import { expect, type Page, test } from './fixtures';

const STAGE = '[data-testid="jukebox-stage"]';
const SCENE_CHUNK_PATTERN = /JukeboxCanvas-[\w-]+\.js/;
// Headless browsers may have no WebGL at all: then the poster is the expected end state.
const SETTLED_STATE_PATTERN = /^(ready|unavailable)$/;
// Software WebGL compiles the physical material shaders slowly.
const SCENE_READY_TIMEOUT_MS = 30_000;
const SCENE_TEST_TIMEOUT_MS = 60_000;

function trackSceneChunk(page: Page) {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (SCENE_CHUNK_PATTERN.test(request.url())) requests.push(request.url());
  });
  return requests;
}

test('prerenders the poster and leaves the 3D chunk out of the initial HTML', async ({
  request,
}) => {
  const html = await (await request.get('/en')).text();

  expect(html).toContain('data-testid="jukebox-stage-poster"');
  expect(html).toContain('/models/jukebox-poster.webp');
  expect(html).not.toMatch(SCENE_CHUNK_PATTERN);
  expect(html).not.toContain('jukebox-stage-canvas');
});

test('keeps the poster and never loads the 3D chunk without WebGL', async ({
  page,
}) => {
  const sceneChunkRequests = trackSceneChunk(page);

  await page.goto('/en');

  await expect(page.locator(STAGE)).toHaveAttribute(
    'data-state',
    'unavailable',
  );
  await expect(page.getByTestId('jukebox-stage-poster')).toBeVisible();
  await expect(page.getByTestId('jukebox-stage-canvas')).toHaveCount(0);
  expect(sceneChunkRequests).toEqual([]);
});

test.describe('with WebGL', () => {
  test.use({ hasWebGL: true });

  test('loads the 3D scene after the page, or keeps the poster if the browser has none', async ({
    page,
  }) => {
    test.setTimeout(SCENE_TEST_TIMEOUT_MS);
    const sceneChunkRequests = trackSceneChunk(page);
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/en');
    const stage = page.locator(STAGE);
    await expect(stage).toHaveAttribute('data-state', SETTLED_STATE_PATTERN, {
      timeout: SCENE_READY_TIMEOUT_MS,
    });
    const state = await stage.getAttribute('data-state');
    test
      .info()
      .annotations.push({ type: 'jukebox-3d', description: `${state}` });

    if (state === 'ready') {
      expect(sceneChunkRequests).toHaveLength(1);
      await expect(page.getByTestId('jukebox-stage-canvas')).toBeAttached();
      await expect(page.getByTestId('jukebox-stage-poster')).toHaveCSS(
        'opacity',
        '0',
      );
    } else {
      expect(sceneChunkRequests).toEqual([]);
      await expect(page.getByTestId('jukebox-stage-poster')).toBeVisible();
    }
    expect(consoleErrors).toEqual([]);
  });

  test('releases its WebGL context when the stage unmounts', async ({
    page,
  }) => {
    test.setTimeout(SCENE_TEST_TIMEOUT_MS);
    // Counts contexts on canvases in the document (the support probe never joins it); a context
    // stops counting once the browser reports it lost, which is what disposing R3F triggers.
    await page.addInitScript(() => {
      const live = new Set<HTMLCanvasElement>();
      const seen = new WeakSet<HTMLCanvasElement>();
      let created = 0;
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        ...args: unknown[]
      ) {
        const context: unknown = Reflect.apply(getContext, this, args);
        const isWebGL = args[0] === 'webgl' || args[0] === 'webgl2';
        if (context && isWebGL && this.isConnected && !seen.has(this)) {
          seen.add(this);
          created += 1;
          live.add(this);
          this.addEventListener('webglcontextlost', () => live.delete(this));
        }
        return context;
      } as typeof getContext;
      window.readWebGLCounts = () => ({ live: live.size, created });
    });
    const readCounts = () =>
      page.evaluate(() => window.readWebGLCounts?.() ?? null);

    await page.goto('/en');
    const stage = page.locator(STAGE);
    await expect(stage).toHaveAttribute('data-state', SETTLED_STATE_PATTERN, {
      timeout: SCENE_READY_TIMEOUT_MS,
    });
    test.skip(
      (await stage.getAttribute('data-state')) !== 'ready',
      'no WebGL in this browser: the poster path is covered above',
    );
    await expect.poll(readCounts).toEqual({ live: 1, created: 1 });

    // No route but home exists yet (legal pages come later), and switching locale keeps the
    // page mounted. A client-side navigation to an unknown path renders the not-found
    // boundary instead, which unmounts the stage; going back mounts a fresh one.
    await page.evaluate(() => {
      window.history.pushState(null, '', '/missing-page');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(stage).toHaveCount(0);
    await expect.poll(readCounts).toEqual({ live: 0, created: 1 });

    await page.goBack();
    await expect(stage).toHaveAttribute('data-state', 'ready', {
      timeout: SCENE_READY_TIMEOUT_MS,
    });
    await expect.poll(readCounts).toEqual({ live: 1, created: 2 });
  });
});
