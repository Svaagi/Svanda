import { CONSENT_COOKIE_NAME, CONSENT_REVISION } from 'constants/consent';
import { LEGAL_PATHS } from 'constants/legal';

import cs from '../src/i18n/locales/cs.json' with { type: 'json' };
import en from '../src/i18n/locales/en.json' with { type: 'json' };
import { expect, type Page, test } from './fixtures';

const BANNER_TITLES = {
  cs: cs.consent.banner.title,
  en: en.consent.banner.title,
};

type StoredConsent = { categories: string[]; revision: number };

async function readStoredConsent(page: Page): Promise<StoredConsent | null> {
  const cookie = (await page.context().cookies()).find(
    ({ name }) => name === CONSENT_COOKIE_NAME,
  );
  if (!cookie) return null;

  return JSON.parse(decodeURIComponent(cookie.value)) as StoredConsent;
}

test.describe('first visit', () => {
  test.use({ hasConsent: false });

  test('shows the banner until a choice is made', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('consent-banner')).toBeVisible();
    expect(await readStoredConsent(page)).toBeNull();
  });

  test('reject all keeps analytics and marketing off and is remembered', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('consent-banner-reject-all').click();

    await expect(page.getByTestId('consent-banner')).toBeHidden();
    expect(await readStoredConsent(page)).toEqual(
      expect.objectContaining({
        categories: ['necessary'],
        revision: CONSENT_REVISION,
      }),
    );

    await page.reload();
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
  });

  test('accept all turns every category on', async ({ page }) => {
    await page.goto('/en');
    await page.getByTestId('consent-banner-accept-all').click();

    await expect(page.getByTestId('consent-banner')).toBeHidden();
    expect((await readStoredConsent(page))?.categories).toEqual([
      'necessary',
      'analytics',
      'marketing',
    ]);
  });

  test('the banner follows the page language', async ({ page, isMobile }) => {
    // The mobile language switch sits in the menu, which the banner partly covers.
    test.skip(isMobile, 'covered by the desktop run');
    await page.goto('/');
    const title = page.getByTestId('consent-banner-title');
    await expect(title).toHaveText(BANNER_TITLES.cs);

    await page.getByTestId('header-language-switch-en').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(title).toHaveText(BANNER_TITLES.en);
  });
});

test.describe('cookie settings', () => {
  test('reopen from the footer of a legal page and save a choice', async ({
    page,
  }) => {
    await page.goto(LEGAL_PATHS.cookies.en);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);

    await page.getByTestId('footer-cookie-settings').click();
    const preferences = page.getByTestId('consent-preferences');
    await expect(preferences).toBeVisible();
    await expect(
      preferences.getByTestId('consent-preferences-marketing'),
    ).not.toBeChecked();

    // The library hides the native checkbox under its pixel switch; its label takes clicks.
    await preferences
      .locator('label:has([data-testid="consent-preferences-marketing"])')
      .click();
    await preferences.getByTestId('consent-preferences-save').click();

    await expect(preferences).toBeHidden();
    expect((await readStoredConsent(page))?.categories).toEqual([
      'necessary',
      'analytics',
      'marketing',
    ]);
  });

  test('reopen from the footer of the home page', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByTestId('home-page')).toBeVisible();

    await page.getByTestId('footer-cookie-settings').click();

    await expect(page.getByTestId('consent-preferences')).toBeVisible();
  });
});
