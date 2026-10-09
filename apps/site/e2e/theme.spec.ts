import { devices, expect, type Page, test } from '@playwright/test';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from 'constants/theme';

const DARK_BG = 'rgb(5, 5, 7)';
const LIGHT_BG = 'rgb(245, 245, 242)';

const bodyBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const bodyCursor = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).cursor);

test.describe('theme', () => {
  test('is dark by default and swaps tokens via data-theme', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute(THEME_ATTRIBUTE, 'dark');
    expect(await bodyBackground(page)).toBe(DARK_BG);

    await page.evaluate(
      (attribute) => document.documentElement.setAttribute(attribute, 'light'),
      THEME_ATTRIBUTE,
    );
    expect(await bodyBackground(page)).toBe(LIGHT_BG);
  });

  test('follows a light system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute(
      THEME_ATTRIBUTE,
      'light',
    );
  });

  test('applies a stored theme before any app script runs', async ({
    page,
  }) => {
    await page.addInitScript(
      (key) => window.localStorage.setItem(key, 'light'),
      THEME_STORAGE_KEY,
    );
    // Without the app bundle only the head script can set the theme: proof of no flash.
    await page.route('**/assets/*.js', (route) => route.abort());
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute(
      THEME_ATTRIBUTE,
      'light',
    );
    expect(await bodyBackground(page)).toBe(LIGHT_BG);
  });
});

test.describe('reduced motion', () => {
  test('clamps transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const duration = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.transition = 'opacity 1s';
      document.body.append(probe);
      return getComputedStyle(probe).transitionDuration;
    });

    expect(parseFloat(duration)).toBeLessThan(0.001);
  });
});

test.describe('pixel cursor', () => {
  test('is used on fine pointers', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-cursor', 'on');
    expect(await bodyCursor(page)).toContain('/cursors/cursor-arrow.png');
  });

  test('switches to the magenta set', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() =>
      document.documentElement.setAttribute('data-cursor', 'magenta'),
    );

    expect(await bodyCursor(page)).toContain(
      '/cursors/cursor-arrow-magenta.png',
    );
  });

  test('is not used on coarse pointers', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await context.newPage();
    await page.goto('/');

    expect(await bodyCursor(page)).toBe('auto');
    await context.close();
  });
});
