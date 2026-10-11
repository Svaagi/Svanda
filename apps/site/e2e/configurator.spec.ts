import { expect, type Page, test } from './fixtures';

const PANELS = 'configurator-panels';
const ACTIONS = `${PANELS}-actions`;
const SCREEN_PIXEL = 'configurator-screen-pixel';
const DESKTOP_ONLY = 'the side columns are the desktop layout';
const MOBILE_ONLY = 'the bottom sheet is the small screen layout';

const scrolledPages = (page: Page) =>
  page.evaluate(() => {
    const viewport = document.querySelector(
      '[data-testid="stage-shell-viewport"]',
    );
    return viewport ? window.scrollY / viewport.clientHeight : Number.NaN;
  });

const screenVar = (page: Page, name: string) =>
  page
    .getByTestId(SCREEN_PIXEL)
    .evaluate(
      (element, cssVar) => element.style.getPropertyValue(cssVar),
      name,
    );

async function openCustomPage(page: Page, path = '/en#custom') {
  await page.goto(path);
  await expect(page.getByTestId('page-layer-custom')).toHaveAttribute(
    'data-active',
    'true',
  );
}

// Small screens keep the controls in the bottom sheet; open it first there.
async function showControls(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByTestId('configurator-sheet-open').click();
  await expect(page.getByTestId(`${PANELS}-start`)).toBeVisible();
}

test.describe('configurator', () => {
  test('stands the live screen flat without WebGL', async ({ page }) => {
    await openCustomPage(page);

    const flatScreen = page.getByTestId('configurator-flat-screen');
    await expect(flatScreen).toBeVisible();
    await expect(
      page.getByTestId('configurator-flat-screen-screen-pixel'),
    ).toBeInViewport();
    const box = await page
      .getByTestId('configurator-flat-screen-screen')
      .boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
  });

  test('edits the live screen and keeps the edit across a reload', async ({
    page,
    isMobile,
  }) => {
    await openCustomPage(page);
    await showControls(page, isMobile);

    const hex = page.getByTestId('configurator-control-base-hex');
    await hex.fill('#123456');
    await hex.press('Enter');
    await expect.poll(() => screenVar(page, '--app-base')).toBe('#123456');

    await page.getByTestId('configurator-control-acc-swatch-ff4fd8').click();
    await expect.poll(() => screenVar(page, '--app-acc')).toBe('#ff4fd8');

    await page.reload();
    await expect.poll(() => screenVar(page, '--app-base')).toBe('#123456');
  });

  test('reverts an invalid hex and says why', async ({ page, isMobile }) => {
    await openCustomPage(page);
    await showControls(page, isMobile);

    const hex = page.getByTestId('configurator-control-txt-hex');
    await page.getByTestId(`${PANELS}-end-groups-songList-trigger`).click();
    await hex.fill('nope');
    await hex.press('Enter');

    await expect(hex).toHaveValue('#FFFFFF');
    await expect(page.getByTestId('toast-message')).toHaveText(
      'Enter a colour as #RRGGBB.',
    );
  });

  test('is operable by keyboard without turning the page', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await openCustomPage(page);

    const glass = page.getByTestId('configurator-switches-design-glass');
    await glass.focus();
    await page.keyboard.press('Space');
    await expect(glass).toHaveAttribute('data-state', 'on');

    const speed = page.getByTestId('configurator-control-speed-slider-thumb');
    await speed.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await expect(speed).toHaveAttribute('aria-valuenow', '1.2');

    const trigger = page.getByTestId(`${PANELS}-start-groups-effects-trigger`);
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowDown');
    await expect(trigger).not.toBeFocused();

    await expect(page.getByTestId('page-layer-custom')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(await scrolledPages(page)).toBe(3);
  });

  test('switches its labels live with the language', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await openCustomPage(page, '/#custom');
    const reset = page.getByTestId(`${ACTIONS}-reset`);
    await expect(reset).toHaveText('Výchozí barvy');

    await page.getByTestId('header-language-switch-en').click();

    await expect(reset).toHaveText('Reset colours');
    await expect(page.getByTestId(`${PANELS}-editing`)).toHaveText(
      'Editing Pixel · Karaoke',
    );
  });

  test('copies by hand from the import field when the clipboard is refused', async ({
    page,
    context,
    isMobile,
  }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await openCustomPage(page);
    await showControls(page, isMobile);

    await page.getByTestId(`${ACTIONS}-copy-json`).click();

    const field = page.getByTestId(`${ACTIONS}-import-text`);
    await expect(field).toBeFocused();
    await expect(field).toHaveValue(/"pixel"/);
    await expect(page.getByTestId('toast-message')).toHaveText(
      'The text is selected in the field below, copy it with Ctrl+C.',
    );
  });

  test('attaching the configuration scrolls to the contact form', async ({
    page,
    isMobile,
  }) => {
    await openCustomPage(page);
    await showControls(page, isMobile);

    await page.getByTestId(`${ACTIONS}-attach`).click();

    await expect.poll(() => scrolledPages(page)).toBe(5);
    await expect(page.getByTestId('configurator-sheet')).toHaveCount(0);
    await page.goto('/en#custom');
    await showControls(page, isMobile);
    await expect(page.getByTestId(`${ACTIONS}-attach`)).toHaveText(
      'Added to e-mail · remove',
    );
  });

  test('keeps the controls in a bottom sheet closed with Done', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, MOBILE_ONLY);
    await openCustomPage(page);
    await expect(page.getByTestId(`${PANELS}-start`)).toHaveCount(0);

    await showControls(page, isMobile);
    const sheet = page.getByRole('dialog', { name: 'Colours' });
    await expect(sheet).toBeVisible();
    await page.getByTestId('configurator-sheet-close').click();

    await expect(sheet).toHaveCount(0);
    await expect(page.getByTestId('configurator-sheet-open')).toBeVisible();
  });
});
