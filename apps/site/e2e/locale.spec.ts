import { expect, test } from '@playwright/test';

const SUBTITLES = {
  cs: 'Vlastní skříň, vlastní appka, vlastní karaoke verze skladeb.',
  en: 'Our own cabinet, our own app, our own karaoke versions of every song.',
  sk: 'Vlastná skriňa, vlastná appka, vlastné karaoke verzie skladieb.',
};

const LOCALE_PAGES = [
  { path: '/', locale: 'cs' },
  { path: '/en', locale: 'en' },
  { path: '/sk', locale: 'sk' },
] as const;

test.describe('locale routing', () => {
  for (const { path, locale } of LOCALE_PAGES) {
    test(`prerenders ${path} with ${locale} copy`, async ({ request }) => {
      const html = await (await request.get(path)).text();

      expect(html).toContain(`<html lang="${locale}"`);
      expect(html).toContain(SUBTITLES[locale]);
    });
  }

  test('switching locale keeps the section hash and updates copy', async ({
    page,
  }) => {
    await page.goto('/#custom');

    await page.getByTestId('language-switch-sk').click();

    await expect(page).toHaveURL(/\/sk#custom$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'sk');
    await expect(page.getByTestId('home-page-subtitle')).toHaveText(
      SUBTITLES.sk,
    );
    await expect(page.getByTestId('language-switch-sk')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('a later visit to / follows an explicit choice only', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);

    await page.getByTestId('language-switch-en').click();
    await expect(page).toHaveURL(/\/en$/);

    await page.goto('/');

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByTestId('home-page-subtitle')).toHaveText(
      SUBTITLES.en,
    );
  });
});
