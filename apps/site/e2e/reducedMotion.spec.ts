import { VP_CSS_PROPERTY } from 'constants/stage';

import { expect, type Page, test } from './fixtures';

const KEYBOARD_SKIP_REASON = 'keyboard paging is a desktop path';
// Longer than the hero's idle frame interval, so a twinkling grid would have redrawn.
const STILL_FRAME_WAIT_MS = 1000;

// A cheap fingerprint of the hero canvas pixels: equal fingerprints mean an unchanged frame.
// Null until the canvas has been sized and drawn (all pixels still zero).
const heroFingerprint = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '[data-testid="hero-background-canvas"]',
    );
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return null;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let hash = 0;
    let isDrawn = false;
    for (let i = 0; i < data.length; i++) {
      const value = data[i] ?? 0;
      hash = (hash * 31 + value) | 0;
      if (value > 0) isDrawn = true;
    }
    return isDrawn ? hash : null;
  });

// Every value `--sv-vp` takes from now on, recorded in the page.
const recordVp = (page: Page, property: string) =>
  page.evaluate((name) => {
    const root = document.documentElement;
    const values: string[] = [];
    new MutationObserver(() => {
      values.push(root.style.getPropertyValue(name));
    }).observe(root, { attributes: true, attributeFilter: ['style'] });
    Object.assign(window, { recordedVp: values });
  }, property);

const recordedVp = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { recordedVp: string[] }).recordedVp,
  );

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the hero is static', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByTestId('hero-overlay-cta')).toBeVisible();
    await expect.poll(() => heroFingerprint(page)).not.toBeNull();
    const firstFrame = await heroFingerprint(page);

    await page.waitForTimeout(STILL_FRAME_WAIT_MS);

    expect(await heroFingerprint(page)).toBe(firstFrame);
  });

  test('paging jumps straight to the next page', async ({ page, isMobile }) => {
    test.skip(isMobile, KEYBOARD_SKIP_REASON);
    await page.goto('/en');
    await expect(page.getByTestId('page-layer-top')).toHaveAttribute(
      'data-active',
      'true',
    );
    await recordVp(page, VP_CSS_PROPERTY);

    await page.keyboard.press('PageDown');
    await expect(page.getByTestId('page-layer-karaoke')).toHaveAttribute(
      'data-active',
      'true',
    );
    await page.getByTestId('header-items-right-link-venues').click();
    await expect(page.getByTestId('page-layer-venues')).toHaveAttribute(
      'data-active',
      'true',
    );

    const values = (await recordedVp(page)).filter((value) => value !== '');
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => Number.isInteger(Number(value)))).toBe(true);
  });
});
