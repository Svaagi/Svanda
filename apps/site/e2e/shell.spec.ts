import { expect, type Page, test } from '@playwright/test';

const DESKTOP_ONLY = 'the inline nav items are a desktop layout';
const MOBILE_ONLY = 'the menu button is a mobile layout';

// The scroll position in stage pages; a settled page change lands on a whole number.
const scrolledPages = (page: Page) =>
  page.evaluate(() => {
    const viewport = document.querySelector(
      '[data-testid="stage-shell-viewport"]',
    );
    return viewport ? window.scrollY / viewport.clientHeight : Number.NaN;
  });

test.describe('header', () => {
  test('nav links page the stage and mark the current item', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await page.goto('/');
    await expect(page.getByTestId('header-menu-button')).toBeHidden();

    await page.getByTestId('header-items-right-link-venues').click();
    await expect.poll(() => scrolledPages(page)).toBe(4);
    await expect(
      page.getByTestId('header-items-right-link-venues'),
    ).toHaveAttribute('aria-current', 'true');

    await page.getByTestId('header-logo').click();
    await expect.poll(() => scrolledPages(page)).toBe(0);
  });

  test('the skip link is the first stop and focuses main', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByTestId('skip-link')).toBeFocused();
    await expect(page.getByTestId('skip-link')).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.getByTestId('home-page')).toBeFocused();
  });

  test('the mobile menu traps focus, closes on Escape and on navigation', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, MOBILE_ONLY);
    await page.goto('/');
    await expect(
      page.getByTestId('header-items-right-link-venues'),
    ).toBeHidden();
    const menuButton = page.getByTestId('header-menu-button');

    // Opened from the keyboard: WebKit does not focus a clicked button, so a mouse open has
    // no focused element to restore.
    await menuButton.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByTestId('mobile-menu');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Shift+Tab');
    expect(
      await menu.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(menuButton).toBeFocused();

    await menuButton.click();
    await page.getByTestId('mobile-menu-link-venues').click();
    await expect(menu).toBeHidden();
    await expect.poll(() => scrolledPages(page)).toBe(4);
  });
});

test('the footer links the social profiles and the imprint', async ({
  page,
}) => {
  await page.goto('/en');
  const footer = page.getByTestId('footer');

  await expect(footer.getByTestId('footer-instagram')).toHaveAttribute(
    'target',
    '_blank',
  );
  await expect(footer.getByTestId('footer-imprint')).toHaveAttribute(
    'href',
    '/en/legal',
  );
});

test('has no horizontal scroll at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
