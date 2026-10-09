import { JUKEBOX_CONFIG_DEFAULTS } from '@svanda/shared';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { CONTACT_ENDPOINT } from 'constants/contact';
import { LEGAL_LINKS } from 'constants/legal';
import { useConfiguratorStore } from 'features/configurator';
import { catalogs } from 'i18n/catalogs';
import { renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAltcha } from './altcha';
import { AltchaError } from './altcha/altchaError';
import { ContactForm } from './ContactForm';

vi.mock('./altcha', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./altcha')>()),
  useAltcha: vi.fn(),
}));

const FORM = 'contact-form';
const ALTCHA_PAYLOAD = 'solved-payload';
const prepareMock = vi.fn();
const takePayloadMock = vi.fn<() => Promise<string>>();
const fetchMock = vi.fn<typeof fetch>();

const byTestId = (testId: string) => screen.getByTestId(testId);
const input = (field: string) => byTestId(`${FORM}-${field}-input`);
const fieldError = (field: string) => byTestId(`${FORM}-${field}-error`);
const status = () => byTestId(`${FORM}-status`);

const jsonResponse = (statusCode: number, body: unknown) =>
  new Response(JSON.stringify(body), { status: statusCode });

function fillForm() {
  fireEvent.change(input('name'), { target: { value: ' Jana ' } });
  fireEvent.change(input('venue'), { target: { value: 'Bar U Lipy, Brno' } });
  fireEvent.change(input('email'), { target: { value: 'jana@example.com' } });
}

async function submit() {
  await act(async () => {
    fireEvent.submit(byTestId(FORM));
  });
}

function sentRequest(): unknown {
  const [url, init] = fetchMock.mock.calls[0] ?? [];
  expect(url).toBe(CONTACT_ENDPOINT);
  return JSON.parse(String(init?.body));
}

describe('ContactForm', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useConfiguratorStore.setState({
      config: JUKEBOX_CONFIG_DEFAULTS,
      isAttached: false,
    });
    takePayloadMock.mockResolvedValue(ALTCHA_PAYLOAD);
    vi.mocked(useAltcha).mockReturnValue({
      prepare: prepareMock,
      takePayload: takePayloadMock,
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it.each(['cs', 'en', 'sk'] as const)(
    'shows the %s validation messages and sends nothing',
    async (locale) => {
      renderAtPath(<ContactForm />, locale === 'cs' ? '/' : `/${locale}`);
      const { errors } = catalogs[locale].contact;

      fireEvent.change(input('email'), { target: { value: 'jana@' } });
      await submit();

      expect(fieldError('name')).toHaveTextContent(errors.required);
      expect(fieldError('venue')).toHaveTextContent(errors.required);
      expect(fieldError('email')).toHaveTextContent(errors.email);
      expect(input('name')).toHaveAttribute('aria-invalid', 'true');
      expect(fieldError('message')).toBeEmptyDOMElement();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('starts the proof of work once the visitor focuses a field', () => {
    renderAtPath(<ContactForm />, '/en');
    expect(prepareMock).not.toHaveBeenCalled();

    fireEvent.focus(input('name'));

    expect(prepareMock).toHaveBeenCalled();
  });

  it('sends the trimmed fields with locale and proof of work, then shows the sent state', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { status: 'sent' }));
    renderAtPath(<ContactForm />, '/en');

    fillForm();
    await submit();

    expect(sentRequest()).toEqual({
      name: 'Jana',
      venue: 'Bar U Lipy, Brno',
      email: 'jana@example.com',
      honeypot: '',
      locale: 'en',
      altcha: ALTCHA_PAYLOAD,
    });
    await waitFor(() => expect(byTestId(`${FORM}-sent`)).toHaveFocus());
    expect(byTestId(`${FORM}-sent`)).toHaveTextContent(
      catalogs.en.contact.sent,
    );
    expect(screen.queryByTestId(FORM)).not.toBeInTheDocument();
  });

  it('says it is sending while the submit is under way', async () => {
    takePayloadMock.mockReturnValue(new Promise(() => undefined));
    renderAtPath(<ContactForm />, '/en');

    fillForm();
    await submit();

    expect(byTestId(`${FORM}-submit`)).toBeDisabled();
    expect(byTestId(`${FORM}-submit`)).toHaveTextContent(
      catalogs.en.contact.form.submitting,
    );
    expect(status()).toHaveTextContent(catalogs.en.contact.status.sending);
  });

  it('shows a translated server error and keeps the input', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(502, { error: { code: 'contact.send_failed' } }),
    );
    renderAtPath(<ContactForm />, '/sk');

    fillForm();
    fireEvent.change(input('message'), { target: { value: 'Ahoj' } });
    await submit();

    expect(status()).toHaveAttribute('data-state', 'error');
    expect(status()).toHaveTextContent(catalogs.sk.contact.status.sendFailed);
    expect(input('venue')).toHaveValue('Bar U Lipy, Brno');
    expect(input('message')).toHaveValue('Ahoj');
    expect(byTestId(`${FORM}-submit`)).toBeEnabled();
  });

  it.each([
    [
      'no connection',
      new AltchaError({ reason: 'network' }),
      catalogs.en.contact.status.networkError,
    ],
    [
      'a rate limited challenge',
      new AltchaError({ reason: 'rate_limited', retryAfterSeconds: 120 }),
      'You have sent too many messages. Try again in 2 min.',
    ],
    [
      'an unsolved challenge',
      new AltchaError({ reason: 'not_solved' }),
      catalogs.en.contact.status.captchaFailed,
    ],
    [
      'an unexpected failure',
      new Error('boom'),
      catalogs.en.contact.status.captchaFailed,
    ],
  ])(
    'explains a proof of work that failed on %s without sending',
    async (_label, error, message) => {
      takePayloadMock.mockRejectedValue(error);
      renderAtPath(<ContactForm />, '/en');

      fillForm();
      await submit();

      expect(status()).toHaveTextContent(message);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('sends the configuration only while it is attached', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { status: 'sent' }));
    renderAtPath(<ContactForm />, '/en');

    fireEvent.click(byTestId(`${FORM}-config-add`));
    fillForm();
    await submit();

    expect(sentRequest()).toMatchObject({ config: JUKEBOX_CONFIG_DEFAULTS });
  });

  it('links the privacy policy of the locale next to the submit button', () => {
    renderAtPath(<ContactForm />, '/en');
    const privacy = LEGAL_LINKS.find(({ id }) => id === 'privacy');

    expect(byTestId(`${FORM}-privacy`).querySelector('a')).toHaveAttribute(
      'href',
      privacy?.paths.en,
    );
  });
});
