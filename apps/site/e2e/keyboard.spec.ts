import {
  STAGE_PAGE_IDS,
  type StagePageId,
  VP_CSS_DECIMALS,
  VP_CSS_PROPERTY,
} from 'constants/stage';

import { expect, type Page, test } from './fixtures';

const DESKTOP_ONLY =
  'Tab walks are a desktop path (WebKit on iOS does not Tab to links by default)';
// More stops than the longest walk below, so a focus trap fails instead of looping forever.
const MAX_TAB_STOPS = 80;

type FocusStop = {
  testId: string;
  layerId: string | null;
  isVisible: boolean;
  hasFocusRing: boolean;
  isInert: boolean;
};

// Presses Tab and describes where focus landed: on what, in which stage layer, and whether a
// sighted keyboard user can see it.
async function tab(page: Page): Promise<FocusStop> {
  await page.keyboard.press('Tab');
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement) || element === document.body) {
      return {
        testId: 'body',
        layerId: null,
        isVisible: true,
        hasFocusRing: true,
        isInert: false,
      };
    }
    const style = getComputedStyle(element);
    const hasOutline =
      style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    const layer = element.closest('[data-testid^="page-layer-"]');
    return {
      testId: element.dataset.testid ?? element.tagName.toLowerCase(),
      layerId:
        layer?.getAttribute('data-testid')?.replace('page-layer-', '') ?? null,
      isVisible: element.checkVisibility({
        opacityProperty: true,
        visibilityProperty: true,
      }),
      hasFocusRing:
        element.matches(':focus-visible') &&
        (hasOutline || style.boxShadow !== 'none'),
      isInert: element.closest('[inert]') !== null,
    };
  });
}

const expectUsableStop = (stop: FocusStop) => {
  expect(stop, `focus on ${stop.testId}`).toMatchObject({
    isVisible: true,
    hasFocusRing: true,
    isInert: false,
  });
};

// Tabs until `isLast` holds for a stop, checking every stop on the way.
async function walkUntil(page: Page, isLast: (stop: FocusStop) => boolean) {
  const stops: FocusStop[] = [];
  for (let i = 0; i < MAX_TAB_STOPS; i++) {
    const stop = await tab(page);
    expectUsableStop(stop);
    stops.push(stop);
    if (isLast(stop)) return stops;
  }
  throw new Error(
    `no end of the Tab walk after ${MAX_TAB_STOPS} stops: ${stops.map(({ testId, layerId }) => `${testId}@${layerId}`).join(' ')}`,
  );
}

const expectInOrder = (stops: readonly FocusStop[], testIds: string[]) => {
  const seen = stops.map(({ testId }) => testId);
  expect(seen.filter((testId) => testIds.includes(testId))).toEqual(testIds);
};

// The pages with controls of their own. The karaoke and jukebox pages' only control is the
// display compare on the 3D screen, which needs WebGL (jukebox3d.spec.ts drives it).
const CONTROL_PAGE_NAV_LINKS = [
  { pageId: 'custom', link: 'header-items-left-link-custom' },
  { pageId: 'venues', link: 'header-items-right-link-venues' },
] as const;

const rootVp = (page: Page) =>
  page.evaluate(
    (property) => document.documentElement.style.getPropertyValue(property),
    VP_CSS_PROPERTY,
  );

// Active, and the page tween has landed: a layer still fading in is hidden and skipped by Tab.
const expectActiveLayer = async (page: Page, pageId: StagePageId) => {
  await expect(page.getByTestId(`page-layer-${pageId}`)).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect
    .poll(() => rootVp(page))
    .toBe(STAGE_PAGE_IDS.indexOf(pageId).toFixed(VP_CSS_DECIMALS));
};

test.describe('keyboard path', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, DESKTOP_ONLY);
  });

  test('Tab walks the header, the hero, the contact form and the footer', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.getByTestId('home-page')).toBeVisible();

    const stops = await walkUntil(
      page,
      ({ testId }) => testId === 'footer-cookie-settings',
    );

    expectInOrder(stops, [
      'skip-link',
      'header-theme-toggle',
      'header-items-left-link-karaoke',
      'header-logo',
      'header-items-right-link-contact',
      'header-language-switch-sk',
      'hero-overlay-cta',
      'contact-section-form-name-input',
      'contact-section-form-message-input',
      'contact-section-form-submit',
      'footer-imprint',
      'footer-cookie-settings',
    ]);
  });

  for (const { pageId, link } of CONTROL_PAGE_NAV_LINKS) {
    test(`the ${pageId} page is reached from the nav and Tab walks its controls`, async ({
      page,
    }) => {
      await page.goto('/en');
      await page.getByTestId(link).focus();
      await page.keyboard.press('Enter');
      await expectActiveLayer(page, pageId);

      // The rest of the header comes first, then the page, then whatever follows the stage.
      let hasEnteredPage = false;
      const stops = await walkUntil(page, ({ layerId }) => {
        if (layerId === pageId) hasEnteredPage = true;
        return hasEnteredPage && layerId !== pageId;
      });
      const layerIds = stops.map(({ layerId }) => layerId);

      expect(layerIds).toContain(pageId);
      expect(layerIds.filter((layerId) => layerId !== null)).toEqual(
        layerIds.filter((layerId) => layerId === pageId),
      );
    });
  }

  test('after a deep link the next Tab lands on that page', async ({
    page,
  }) => {
    await page.goto('/en#custom');
    await expectActiveLayer(page, 'custom');

    const stop = await tab(page);

    expectUsableStop(stop);
    expect(stop.layerId).toBe('custom');
  });

  test('paging keys reach every page and Tab follows the page on screen', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.getByTestId('home-page')).toBeVisible();

    for (const pageId of STAGE_PAGE_IDS.slice(1)) {
      await page.keyboard.press('PageDown');
      await expectActiveLayer(page, pageId);
    }
    await page.keyboard.press('PageDown');
    await expect(page.getByTestId('contact-section')).toBeInViewport();

    const stop = await tab(page);
    expectUsableStop(stop);
    expect(stop.layerId).toBeNull();
  });
});
