import { LEGAL_LINKS } from 'constants/legal';
import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import { LOCALES } from 'constants/locales';

import { expect, test } from './fixtures';

const PAGES = LEGAL_LINKS.flatMap(({ id, paths }) =>
  LOCALES.map((locale) => ({ id, locale, path: paths[locale] })),
);

for (const { id, locale, path } of PAGES) {
  test(`prerenders and shows the ${locale} ${id} page at ${path}`, async ({
    page,
    request,
  }) => {
    const html = await (await request.get(path)).text();
    expect(html).toContain('data-testid="legal-page"');
    expect(html).toContain(`data-page="${id}"`);
    expect(html).toContain('data-testid="legal-page-content-title"');

    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(path);

    const legalPage = page.getByTestId('legal-page');
    await expect(legalPage).toHaveAttribute('data-page', id);
    await expect(legalPage).toHaveAttribute('data-locale', locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByTestId('legal-page-content-title')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
}

test('the prerendered imprint carries the identity', async ({ request }) => {
  const html = await (await request.get('/pravni-informace')).text();

  expect(html).toContain(LEGAL_IDENTITY.ico);
  expect(html).toContain(LEGAL_IDENTITY.seat);
});

test('the footer opens each legal page and the header leads back home', async ({
  page,
}) => {
  await page.goto('/en');

  for (const { id, paths } of LEGAL_LINKS) {
    await page.getByTestId(`footer-${id}`).click();
    await expect(page).toHaveURL(paths.en);
    await expect(page.getByTestId('legal-page')).toHaveAttribute(
      'data-page',
      id,
    );
  }

  await page.getByTestId('legal-header-home').click();
  await expect(page).toHaveURL('/en');
  await expect(page.getByTestId('home-page')).toBeVisible();
});

test('the language switch keeps the legal page', async ({ page }) => {
  await page.goto('/ochrana-osobnich-udaju');

  await page.getByTestId('legal-header-language-switch-sk').click();

  await expect(page).toHaveURL('/sk/ochrana-osobnych-udajov');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk');
  await expect(page.getByTestId('legal-page')).toHaveAttribute(
    'data-locale',
    'sk',
  );
});

test('a legal page has no horizontal scroll at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/sk/ochrana-osobnych-udajov');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
