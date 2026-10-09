import { expect, type Page, test } from './fixtures';

const KEYBOARD_SKIP_REASON = 'keyboard paging is a desktop path';

// The scroll position in stage pages; a settled page change lands on a whole number.
const scrolledPages = (page: Page) =>
  page.evaluate(() => {
    const viewport = document.querySelector(
      '[data-testid="stage-shell-viewport"]',
    );
    return viewport ? window.scrollY / viewport.clientHeight : Number.NaN;
  });

const rootVp = (page: Page) =>
  page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--sv-vp'),
  );

const expectOnPage = async (page: Page, layerId: string, pageIndex: number) => {
  await expect(page.getByTestId(`page-layer-${layerId}`)).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect.poll(() => scrolledPages(page)).toBe(pageIndex);
  await expect.poll(() => rootVp(page)).toBe(`${pageIndex}.0000`);
};

test.describe('stage paging', () => {
  test('keyboard moves exactly one page per press', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, KEYBOARD_SKIP_REASON);
    await page.goto('/');
    await expectOnPage(page, 'top', 0);

    await page.keyboard.press('PageDown');
    await expectOnPage(page, 'karaoke', 1);

    await page.keyboard.press('ArrowDown');
    await expectOnPage(page, 'jukebox', 2);

    await page.keyboard.press('ArrowUp');
    await expectOnPage(page, 'karaoke', 1);

    await page.keyboard.press('Space');
    await expectOnPage(page, 'jukebox', 2);
  });

  test('End reaches contact and Home returns to the top', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, KEYBOARD_SKIP_REASON);
    await page.goto('/');

    await page.keyboard.press('End');
    await expect.poll(() => scrolledPages(page)).toBeGreaterThanOrEqual(5);
    await expect(page.getByTestId('contact-section')).toBeInViewport();

    await page.keyboard.press('Home');
    await expectOnPage(page, 'top', 0);
  });

  test('the /#venues deep link lands on page 4', async ({ page }) => {
    await page.goto('/#venues');

    await expectOnPage(page, 'venues', 4);
    await expect(page.getByTestId('page-layer-top')).toHaveAttribute(
      'data-visible',
      'false',
    );
  });
});
