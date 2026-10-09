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
// Each page turn needs fresh software-rendered frames before the display quad follows.
const SCENE_FRAME_TIMEOUT_MS = 20_000;
const PAGING_TEST_TIMEOUT_MS = 120_000;
const PROJECTED = 'projected-screen';
const PIXEL_LAVA = 'display-compare-pixel-lava';
const GLASS_LAVA = 'display-compare-glass-lava';
const SPLIT_HANDLE = 'display-compare-handle';
const KEYBOARD_SKIP_REASON = 'keyboard paging is a desktop path';

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

test('keeps the projected display hidden and inert while no 3D display is drawn', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, KEYBOARD_SKIP_REASON);
  await page.goto('/en');
  const projected = page.getByTestId(PROJECTED);
  await expect(projected).toHaveAttribute('data-paused', 'true');

  await page.keyboard.press('PageDown');
  await expect(page.getByTestId('page-layer-karaoke')).toHaveAttribute(
    'data-active',
    'true',
  );

  await expect(projected).toHaveAttribute('data-mode', 'sing');
  await expect(projected).toHaveAttribute('data-paused', 'true');
  await expect(projected).toHaveAttribute('inert');
  await expect(projected.getByTestId('pixel-jukebox-ui')).toHaveAttribute(
    'data-section',
    'sing',
  );
  await expect(projected.getByTestId('glass-jukebox-ui')).toHaveAttribute(
    'data-section',
    'sing',
  );
  await expect(projected.getByTestId(PIXEL_LAVA)).toHaveAttribute(
    'data-paused',
    'true',
  );
  await expect(projected.getByTestId(GLASS_LAVA)).toHaveAttribute(
    'data-paused',
    'true',
  );
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

  test('lays the projected display over the 3D display on the product pages', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, KEYBOARD_SKIP_REASON);
    test.setTimeout(PAGING_TEST_TIMEOUT_MS);
    await page.goto('/en');
    const stage = page.locator(STAGE);
    await expect(stage).toHaveAttribute('data-state', SETTLED_STATE_PATTERN, {
      timeout: SCENE_READY_TIMEOUT_MS,
    });
    test.skip(
      (await stage.getAttribute('data-state')) !== 'ready',
      'no WebGL in this browser: the hidden path is covered above',
    );
    const projected = page.getByTestId(PROJECTED);
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const centreX = async () => {
      const box = await projected.boundingBox();
      return box ? box.x + box.width / 2 : Number.NaN;
    };

    const frameWait = { timeout: SCENE_FRAME_TIMEOUT_MS };

    // Karaoke: the model stands in the right half, the screen on its display.
    await page.keyboard.press('PageDown');
    await expect(projected).toHaveAttribute(
      'data-interactive',
      'true',
      frameWait,
    );
    await expect(projected).toHaveAttribute('data-mode', 'sing');
    await expect(projected).not.toHaveAttribute('inert');
    await expect.poll(centreX, frameWait).toBeGreaterThan(viewportWidth / 2);
    await expect(page.getByTestId(PIXEL_LAVA)).toHaveAttribute(
      'data-paused',
      'false',
    );
    await expect(page.getByTestId(GLASS_LAVA)).toHaveAttribute(
      'data-paused',
      'false',
    );

    // The compare split moves with the arrow keys; Down still pages from its handle.
    const handle = page.getByTestId(SPLIT_HANDLE);
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '55');

    // Jukebox: mirrored into the left half. The position comes first: the interactive flag
    // still holds the karaoke value until the model has spun over.
    await page.keyboard.press('ArrowDown');
    await expect(projected).toHaveAttribute('data-mode', 'listen', frameWait);
    await expect.poll(centreX, frameWait).toBeLessThan(viewportWidth / 2);
    await expect(projected).toHaveAttribute(
      'data-interactive',
      'true',
      frameWait,
    );

    // Custom: gone again, and the lamps stop.
    await page.keyboard.press('ArrowDown');
    await expect(projected).toHaveAttribute('data-paused', 'true', frameWait);
    await expect(page.getByTestId(PIXEL_LAVA)).toHaveAttribute(
      'data-paused',
      'true',
    );
  });
});
