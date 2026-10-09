import { expect, test } from '@playwright/test';

const LOCALE_PAGES = [
  { path: '/', locale: 'cs' },
  { path: '/en', locale: 'en' },
];

for (const { path, locale } of LOCALE_PAGES) {
  test(`renders the ${locale} home page at ${path} without console errors`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(path);

    await expect(page.getByTestId('home-page')).toHaveAttribute(
      'data-locale',
      locale,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    expect(consoleErrors).toEqual([]);
  });
}
