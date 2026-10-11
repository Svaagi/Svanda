import { ACCENTS } from 'constants/accent';
import { LEGAL_LINKS } from 'constants/legal';
import { LOCALES } from 'constants/locales';
import { NOT_FOUND_PATHS } from 'constants/seo';
import { STAGE_PAGE_IDS } from 'constants/stage';
import { THEMES } from 'constants/theme';

import {
  axeViolations,
  forceAccent,
  presetTheme,
  settleAnimations,
} from './axe';
import { expect, test } from './fixtures';

const HOME_PATHS: Readonly<Record<(typeof LOCALES)[number], string>> = {
  cs: '/',
  en: '/en',
  sk: '/sk',
};

// Every prerendered route: home, each legal page and the not-found page, per locale.
const ROUTES = LOCALES.flatMap((locale) => [
  { name: `${locale} home`, path: HOME_PATHS[locale], testId: 'home-page' },
  ...LEGAL_LINKS.map(({ id, paths }) => ({
    name: `${locale} ${id}`,
    path: paths[locale],
    testId: 'legal-page',
  })),
  {
    name: `${locale} not found`,
    path: NOT_FOUND_PATHS[locale],
    testId: 'not-found-page',
  },
]);

const CONTRAST_RULES = ['color-contrast'] as const;
const MOBILE_ONLY = 'the menu button is a mobile layout';

for (const theme of THEMES) {
  test.describe(`axe in the ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await presetTheme(page, theme);
    });

    for (const { name, path, testId } of ROUTES) {
      test(`the ${name} page at ${path} has no violations`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(page.getByTestId(testId)).toBeVisible();

        expect(await axeViolations(page)).toEqual([]);
      });
    }

    // Inactive stage pages are hidden, so each one is scanned while it is on screen.
    for (const pageId of STAGE_PAGE_IDS) {
      test(`the ${pageId} stage page has no violations`, async ({ page }) => {
        await page.goto(`/en#${pageId}`);
        await expect(page.getByTestId(`page-layer-${pageId}`)).toHaveAttribute(
          'data-active',
          'true',
        );

        expect(await axeViolations(page)).toEqual([]);
      });
    }

    test.describe('on a first visit', () => {
      test.use({ hasConsent: false });

      test('the cookie banner has no violations', async ({ page }) => {
        await page.goto('/en/legal');
        await expect(page.getByTestId('consent-banner')).toBeVisible();
        await settleAnimations(page);

        expect(await axeViolations(page)).toEqual([]);
      });
    });

    test('the open venue lightbox has no violations', async ({ page }) => {
      await page.goto('/en#venues');
      await expect(page.getByTestId('page-layer-venues')).toHaveAttribute(
        'data-active',
        'true',
      );
      await expect(page.getByTestId('venue-frame')).toHaveAttribute(
        'data-snapped',
        'true',
      );
      const trigger = page.getByTestId('venue-frame-slide-lemon-open');
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('venue-lightbox')).toBeVisible();
      await settleAnimations(page);

      expect(await axeViolations(page)).toEqual([]);
    });

    test('the contact form with errors has no violations', async ({ page }) => {
      await page.goto('/en#contact');
      await page.getByTestId('contact-section-form-submit').click();
      await expect(
        page.getByTestId('contact-section-form-name-error'),
      ).toBeVisible();

      expect(await axeViolations(page)).toEqual([]);
    });

    test('the cookie preferences have no violations', async ({ page }) => {
      await page.goto('/en/legal');
      await page.getByTestId('footer-cookie-settings').click();
      await expect(page.getByTestId('consent-preferences')).toBeVisible();
      await settleAnimations(page);

      expect(await axeViolations(page)).toEqual([]);
    });

    test('the open mobile menu has no violations', async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, MOBILE_ONLY);
      await page.goto('/en');
      await page.getByTestId('header-menu-button').click();
      await expect(page.getByTestId('mobile-menu')).toBeVisible();
      await settleAnimations(page);

      expect(await axeViolations(page)).toEqual([]);
    });

    // Each page sets its own accent; forcing the other one checks every page with both.
    for (const accent of ACCENTS) {
      for (const pageId of STAGE_PAGE_IDS) {
        test(`the ${pageId} stage page keeps its contrast with the ${accent} accent`, async ({
          page,
        }) => {
          await page.goto(`/en#${pageId}`);
          await expect(
            page.getByTestId(`page-layer-${pageId}`),
          ).toHaveAttribute('data-active', 'true');
          await forceAccent(page, accent);

          expect(await axeViolations(page, { rules: CONTRAST_RULES })).toEqual(
            [],
          );
        });
      }
    }
  });
}
