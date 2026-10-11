import { INTRO_ATTRIBUTE, INTRO_PLAYING } from 'constants/intro';
import { BITMAP } from 'lib/pixel/bitmaps';
import { countFilledPixels } from 'utils/testing/countFilledPixels';

import { expect, type Page, test } from './fixtures';

// The intro runs on a paused fake clock, so every frame lands at a known time.
const CLOCK_START = new Date('2026-01-01T12:00:00Z');
const CLOCK_PAUSED_AT = new Date('2026-01-01T12:00:01Z');
// After the last swarm cell has landed (4.885s) and before the DOM logo takes over (4.92s).
const SWARM_LANDED_MS = 4900;
const INTRO_DONE_MS = 6600;
const LANDING_WIDTHS = [375, 800, 1440];
const LANDING_HEIGHT = 800;
// Canvas and CSS paint the same sRGB colour; allow for rounding only.
const COLOR_TOLERANCE = 2;

const html = (page: Page) => page.locator('html');

const rootState = (page: Page) =>
  page.evaluate(() => ({
    overflow: getComputedStyle(document.documentElement).overflow,
    inlineLogo: document.documentElement.style.getPropertyValue('--sv-logo'),
  }));

const startPausedIntro = async (page: Page, path = '/') => {
  await page.clock.install({ time: CLOCK_START });
  await page.clock.pauseAt(CLOCK_PAUSED_AT);
  await page.goto(path);
  await expect(html(page)).toHaveAttribute(INTRO_ATTRIBUTE, INTRO_PLAYING);
};

// Samples the intro canvas inside every module of the visible header logo; reports how many
// modules it checked and the samples whose canvas colour differs from the logo's own fill.
const logoMismatches = (page: Page, tolerance: number) =>
  page.evaluate((maxDelta) => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '[data-testid="intro-canvas"]',
    );
    const context = canvas?.getContext('2d');
    const logo = Array.from(
      document.querySelectorAll('[data-testid="header-logo"] svg'),
    ).find((svg) => svg.getBoundingClientRect().width > 0);
    if (!canvas || !context || !logo) return { modules: 0, mismatches: [] };

    const canvasRect = canvas.getBoundingClientRect();
    const dpr = canvas.width / canvasRect.width;
    const channels = (color: string) =>
      (color.match(/\d+/g) ?? []).slice(0, 3).map(Number);
    // A device pixel by its index, relative to the canvas.
    const sample = (x: number, y: number) =>
      Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3);

    const modules = Array.from(logo.querySelectorAll('rect'));
    const mismatches = modules.flatMap((module) => {
      const rect = module.getBoundingClientRect();
      const expected = channels(getComputedStyle(module).fill);
      const toDevice = (value: number, origin: number) =>
        (value - origin) * dpr;
      // The first and last device pixel the module fully covers: an offset of even half a
      // pixel leaves one of them partly or wholly uncovered on the canvas.
      const points = [
        [
          Math.ceil(toDevice(rect.left, canvasRect.left)),
          Math.ceil(toDevice(rect.top, canvasRect.top)),
        ],
        [
          Math.floor(toDevice(rect.right, canvasRect.left)) - 1,
          Math.floor(toDevice(rect.bottom, canvasRect.top)) - 1,
        ],
      ] as const;
      return points
        .map(([x, y]) => sample(x, y))
        .filter((actual) =>
          actual.some(
            (value, index) =>
              Math.abs(value - (expected[index] ?? 0)) > maxDelta,
          ),
        )
        .map(
          (actual) =>
            `${rect.left},${rect.top}: ${actual.join()} vs ${expected.join()}`,
        );
    });
    return { modules: modules.length, mismatches };
  }, tolerance);

test.describe('intro', () => {
  test.use({ hasSeenIntro: false });

  test('plays on the first visit, unlocks scroll, and is skipped on reload', async ({
    page,
  }) => {
    await startPausedIntro(page);
    expect(await rootState(page)).toEqual({
      overflow: 'hidden',
      inlineLogo: '0',
    });

    await page.clock.runFor(INTRO_DONE_MS);
    await expect(html(page)).not.toHaveAttribute(INTRO_ATTRIBUTE);
    expect(await rootState(page)).toEqual({
      overflow: 'visible',
      inlineLogo: '',
    });

    await page.reload();
    await expect(page.getByTestId('home-page')).toBeVisible();
    await page.clock.runFor(1000);
    await expect(html(page)).not.toHaveAttribute(INTRO_ATTRIBUTE);
    await expect(page.getByTestId('intro')).toBeHidden();
    await expect(page.getByTestId('header-logo')).toHaveCSS('opacity', '1');
  });

  for (const width of LANDING_WIDTHS) {
    test(`the swarm lands pixel-exact on the nav logo at ${width}px`, async ({
      page,
      browserName,
      isMobile,
    }) => {
      test.skip(
        browserName !== 'chromium' || isMobile,
        'the landing geometry is engine independent; one desktop engine checks it',
      );
      await page.setViewportSize({ width, height: LANDING_HEIGHT });
      await startPausedIntro(page);

      await page.clock.runFor(SWARM_LANDED_MS);

      expect(await logoMismatches(page, COLOR_TOLERANCE)).toEqual({
        modules: countFilledPixels(BITMAP),
        mismatches: [],
      });
    });
  }
});

test.describe('intro with reduced motion', () => {
  test.use({ hasSeenIntro: false, reducedMotion: 'reduce' });

  test('shows the final state at once', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(html(page)).not.toHaveAttribute(INTRO_ATTRIBUTE);
    await expect(page.getByTestId('intro')).toBeHidden();
    await expect(page.getByTestId('header-logo')).toHaveCSS('opacity', '1');
    expect((await rootState(page)).overflow).toBe('visible');
  });
});
