import { CONTACT_ROUTE } from './contactApiMock';
import { expect, type Page, test } from './fixtures';
import {
  E2E_UMAMI_WEBSITE_ID,
  readPageViews,
  readUmamiCalls,
  readUmamiEvents,
  UMAMI_SCRIPT_URL,
} from './umamiMock';

const DESKTOP_ONLY = 'the desktop layout covers it';
const FORM = 'contact-section-form';

// Resolves once the tracker has loaded and the landing page view has been sent.
async function openTracked(page: Page, path: string) {
  await page.goto(path);
  await expect.poll(() => readPageViews(page)).toHaveLength(1);
}

const events = (page: Page, name: string) => () => readUmamiEvents(page, name);

async function countCalls(page: Page) {
  return (await readUmamiCalls(page))?.length ?? 0;
}

// Collects every request for the tracker script, to prove it was never loaded.
function watchTrackerRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url() === UMAMI_SCRIPT_URL) requests.push(request.url());
  });
  return requests;
}

async function fillContactForm(page: Page) {
  const field = (name: string) => page.getByTestId(`${FORM}-${name}-input`);
  await field('name').fill('Jana Novakova');
  await field('venue').fill('Bar U Lipy, Brno');
  await field('email').fill('jana@example.com');
}

test.describe('analytics', () => {
  test('loads the tracker with automatic tracking off and counts the page view', async ({
    page,
  }) => {
    await openTracked(page, '/en');

    const script = page.locator(`script[src="${UMAMI_SCRIPT_URL}"]`);
    await expect(script).toHaveAttribute(
      'data-website-id',
      E2E_UMAMI_WEBSITE_ID,
    );
    await expect(script).toHaveAttribute('data-auto-track', 'false');
    expect(await readPageViews(page)).toEqual([
      expect.objectContaining({ url: '/en' }),
    ]);
  });

  test('the hero call to action emits one event', async ({ page }) => {
    await openTracked(page, '/en');

    await page.getByTestId('hero-overlay-cta').click();

    await expect
      .poll(events(page, 'cta_click'))
      .toEqual([expect.objectContaining({ data: { target: 'hero' } })]);
    await expect
      .poll(events(page, 'section_view'))
      .toEqual([expect.objectContaining({ data: { section: 'karaoke' } })]);
  });

  test('theme and language changes emit one event each and a page view', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await page.emulateMedia({ colorScheme: 'dark' });
    await openTracked(page, '/en');

    await page.getByTestId('header-theme-toggle').click();
    await expect
      .poll(events(page, 'theme_change'))
      .toEqual([expect.objectContaining({ data: { theme: 'light' } })]);

    await page.getByTestId('header-language-switch-sk').click();
    await expect
      .poll(events(page, 'language_change'))
      .toEqual([
        expect.objectContaining({ url: '/en', data: { from: 'en', to: 'sk' } }),
      ]);
    await expect
      .poll(() => readPageViews(page))
      .toEqual([
        expect.objectContaining({ url: '/en' }),
        expect.objectContaining({ url: '/sk' }),
      ]);
  });

  test('configurator export, edits and attach emit one event each', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await openTracked(page, '/en#custom');
    const actions = 'configurator-panels-actions';

    await page.getByTestId(`${actions}-copy-json`).click();
    await expect
      .poll(events(page, 'configurator_export'))
      .toEqual([expect.objectContaining({ data: { format: 'json' } })]);

    const hex = page.getByTestId('configurator-control-base-hex');
    await hex.fill('#123456');
    await hex.press('Enter');
    await page.getByTestId('configurator-control-acc-swatch-ff4fd8').click();
    await expect
      .poll(events(page, 'configurator_change'))
      .toEqual([
        expect.objectContaining({ data: { design: 'pixel', section: 'sing' } }),
      ]);

    await page.getByTestId(`${actions}-attach`).click();
    await expect
      .poll(events(page, 'configurator_attach'))
      .toEqual([expect.objectContaining({ data: { source: 'configurator' } })]);
  });

  test('opening the configurator sheet emits one event', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'the sheet is the small screen layout');
    await openTracked(page, '/en#custom');

    await page.getByTestId('configurator-sheet-open').click();

    await expect
      .poll(events(page, 'configurator_open'))
      .toEqual([expect.objectContaining({ data: { layout: 'sheet' } })]);
  });

  test('venue changes and the lightbox emit one event each', async ({
    page,
  }) => {
    await openTracked(page, '/en#venues');

    await page.getByTestId('venue-frame-next').click();
    await expect
      .poll(events(page, 'venue_view'))
      .toEqual([expect.objectContaining({ data: { venue: 'arcadeBar' } })]);

    await page.getByTestId('venue-frame-slide-arcadeBar-open').click();
    await expect(page.getByTestId('venue-lightbox')).toBeVisible();
    await expect
      .poll(events(page, 'lightbox_open'))
      .toEqual([expect.objectContaining({ data: { venue: 'arcadeBar' } })]);
  });

  test('a sent contact request emits one event without the form data', async ({
    page,
  }) => {
    await page.route(CONTACT_ROUTE, (route) =>
      route.fulfill({ json: { status: 'sent' } }),
    );
    await openTracked(page, '/en#contact');

    await fillContactForm(page);
    await page.getByTestId(`${FORM}-submit`).click();

    await expect(page.getByTestId(`${FORM}-sent`)).toBeVisible();
    await expect.poll(events(page, 'contact_submit_success')).toHaveLength(1);
    const calls = JSON.stringify(await readUmamiCalls(page));
    expect(calls).not.toContain('jana@example.com');
    expect(calls).not.toContain('Novakova');
  });

  test('a failed contact request emits only its error code', async ({
    page,
  }) => {
    await page.route(CONTACT_ROUTE, (route) =>
      route.fulfill({
        status: 502,
        json: { error: { code: 'contact.send_failed' } },
      }),
    );
    await openTracked(page, '/en#contact');

    await fillContactForm(page);
    await page.getByTestId(`${FORM}-submit`).click();

    await expect
      .poll(events(page, 'contact_submit_error'))
      .toEqual([
        expect.objectContaining({ data: { code: 'contact.send_failed' } }),
      ]);
  });

  test('withdrawing consent stops every call', async ({ page, isMobile }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await page.emulateMedia({ colorScheme: 'dark' });
    await openTracked(page, '/en');

    await page.getByTestId('footer-cookie-settings').click();
    const preferences = page.getByTestId('consent-preferences');
    await preferences
      .locator('label:has([data-testid="consent-preferences-analytics"])')
      .click();
    await preferences.getByTestId('consent-preferences-save').click();
    await expect(preferences).toBeHidden();
    const callCount = await countCalls(page);

    await page.getByTestId('header-theme-toggle').click();
    await page.getByTestId('header-language-switch-sk').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'sk');
    // A later discrete event runs only after React has flushed the navigation's effects,
    // where the page view would have been sent.
    await page.getByTestId('header-theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    expect(await countCalls(page)).toBe(callCount);
  });
});

test.describe('analytics without consent', () => {
  test.use({ hasConsent: false });

  test('rejecting on the banner stops calls and the tracker stays unloaded after', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, DESKTOP_ONLY);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en');
    await page.getByTestId('consent-banner-reject-all').click();
    await expect(page.getByTestId('consent-banner')).toBeHidden();
    const callCount = await countCalls(page);

    await page.getByTestId('header-theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await countCalls(page)).toBe(callCount);

    const requests = watchTrackerRequests(page);
    await page.reload();
    await expect(page.getByTestId('home-page')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(requests).toEqual([]);
  });
});

test.describe('analytics under Do Not Track', () => {
  test('never loads the tracker', async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(Navigator.prototype, 'doNotTrack', {
        get: () => '1',
      }),
    );
    const requests = watchTrackerRequests(page);

    await page.goto('/en');
    await expect(page.getByTestId('home-page')).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(requests).toEqual([]);
    expect(await readUmamiCalls(page)).toBeNull();
  });
});
