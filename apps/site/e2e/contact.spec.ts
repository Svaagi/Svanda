import { CONTACT_ROUTE, isSolvedAltcha } from './contactApiMock';
import { expect, type Page, test } from './fixtures';

const FORM = 'contact-section-form';
const RETRY_AFTER_S = 600;

const field = (page: Page, name: string) =>
  page.getByTestId(`${FORM}-${name}-input`);

async function fillForm(page: Page) {
  await field(page, 'name').fill('Jana Novakova');
  await field(page, 'venue').fill('Bar U Lipy, Brno');
  await field(page, 'email').fill('jana@example.com');
  await field(page, 'message').fill('Hello');
}

// Answers the submit and keeps the request body for the spec to check.
async function answerSubmit(
  page: Page,
  status: number,
  body: object,
  headers: Record<string, string> = {},
) {
  const requests: Record<string, unknown>[] = [];
  await page.route(CONTACT_ROUTE, async (route) => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({ status, json: body, headers });
  });
  return requests;
}

test.describe('contact form', () => {
  test('sends the request with a solved proof of work and the configuration', async ({
    page,
  }) => {
    const requests = await answerSubmit(page, 200, { status: 'sent' });
    await page.goto('/en#contact');

    await page.getByTestId(`${FORM}-config-add`).click();
    await expect(page.getByTestId(`${FORM}-config-attached`)).toBeVisible();
    await fillForm(page);
    await page.getByTestId(`${FORM}-submit`).click();

    const sent = page.getByTestId(`${FORM}-sent`);
    await expect(sent).toHaveText("Thanks, we'll be in touch.");
    await expect(sent).toBeFocused();
    expect(requests).toHaveLength(1);
    const [request] = requests;
    expect(request).toMatchObject({
      name: 'Jana Novakova',
      venue: 'Bar U Lipy, Brno',
      email: 'jana@example.com',
      message: 'Hello',
      locale: 'en',
      honeypot: '',
      config: expect.any(Object) as unknown,
    });
    expect(await isSolvedAltcha(request?.altcha)).toBe(true);
  });

  test('shows a translated server error and keeps the input', async ({
    page,
  }) => {
    await answerSubmit(
      page,
      429,
      { error: { code: 'contact.rate_limited' } },
      { 'Retry-After': String(RETRY_AFTER_S) },
    );
    await page.goto('/#contact');

    await fillForm(page);
    await page.getByTestId(`${FORM}-submit`).click();

    await expect(page.getByTestId(`${FORM}-status`)).toHaveText(
      'Odeslali jste příliš mnoho zpráv. Zkuste to znovu za 10 min.',
    );
    await expect(field(page, 'venue')).toHaveValue('Bar U Lipy, Brno');
    await expect(field(page, 'message')).toHaveValue('Hello');
    await expect(page.getByTestId(`${FORM}-sent`)).toHaveCount(0);
  });

  test('explains invalid fields without sending', async ({ page }) => {
    const requests = await answerSubmit(page, 200, { status: 'sent' });
    await page.goto('/sk#contact');

    await field(page, 'email').fill('jana@');
    await page.getByTestId(`${FORM}-submit`).click();

    await expect(page.getByTestId(`${FORM}-name-error`)).toHaveText(
      'Vyplňte prosím toto pole.',
    );
    await expect(page.getByTestId(`${FORM}-email-error`)).toHaveText(
      'Zadajte platný e-mail.',
    );
    expect(requests).toHaveLength(0);
  });
});
