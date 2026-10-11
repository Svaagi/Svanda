import { expect, type Page, test } from './fixtures';

const TORCH_SKIP_REASON = 'the mouse torch is a fine pointer path';
const PROBE_X = 200;
// Between the header and the ghost wordmark, so the probe only sees twinkle and torch.
const PROBE_Y = 160;
const PROBE_RADIUS_PX = 40;
// Well under what a lit torch adds around the pointer (about 20 cells at alpha 0.12 or more).
const TORCH_MIN_COVERAGE = 30000;

// Summed alpha of the hero canvas in a box around a point: how much of it is drawn.
const canvasCoverage = (page: Page, x: number, y: number) =>
  page.evaluate(
    ([centreX, centreY, radius]) => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        '[data-testid="hero-background-canvas"]',
      );
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return 0;
      const scale = canvas.width / canvas.clientWidth;
      const { data } = context.getImageData(
        (centreX - radius) * scale,
        (centreY - radius) * scale,
        radius * 2 * scale,
        radius * 2 * scale,
      );
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i + 3] ?? 0;
      }
      return sum;
    },
    [x, y, PROBE_RADIUS_PX] as const,
  );

const totalCoverage = async (page: Page) => {
  const size = page.viewportSize() ?? { width: 0, height: 0 };
  return canvasCoverage(page, size.width / 2, size.height / 2);
};

test.describe('hero', () => {
  test('shows the tag, the call to action and a hidden h1', async ({
    page,
  }) => {
    await page.goto('/en');

    await expect(page.getByTestId('hero-overlay-tag')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'SVANDA, the karaoke jukebox',
    );
    await expect(page.getByTestId('hero-overlay-cta')).toHaveAttribute(
      'href',
      '#karaoke',
    );
  });

  test('the call to action turns to the karaoke page', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('hero-overlay-cta').click();

    await expect(page.getByTestId('page-layer-karaoke')).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(page.getByTestId('hero-overlay')).toHaveCSS('opacity', '0');
  });

  test('draws the pixel background', async ({ page }) => {
    await page.goto('/');

    await expect.poll(() => totalCoverage(page)).toBeGreaterThan(0);
  });

  test('the torch lights the grid around the mouse', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, TORCH_SKIP_REASON);
    // Reduced motion freezes the twinkle, so only the torch changes the probe.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect.poll(() => totalCoverage(page)).toBeGreaterThan(0);
    const unlitCoverage = await canvasCoverage(page, PROBE_X, PROBE_Y);

    await page.mouse.move(PROBE_X, PROBE_Y);

    await expect
      .poll(() => canvasCoverage(page, PROBE_X, PROBE_Y))
      .toBeGreaterThan(unlitCoverage + TORCH_MIN_COVERAGE);
  });

  test('reduced motion still shows a static background', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.getByTestId('hero-overlay-cta')).toBeVisible();
    await expect.poll(() => totalCoverage(page)).toBeGreaterThan(0);
  });
});
