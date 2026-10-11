import { LOCALE_STORAGE_KEY } from 'constants/locales';
import { getCurrentLocation, renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { useRememberedLocaleRedirect } from './useRememberedLocaleRedirect';

function RedirectProbe() {
  useRememberedLocaleRedirect();

  return null;
}

describe('useRememberedLocaleRedirect', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('sends a visit to the root to the remembered locale, keeping the hash', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en');

    renderAtPath(<RedirectProbe />, '/#custom');

    expect(getCurrentLocation()).toHaveTextContent('/en#custom');
  });

  it('stays on the root without an explicit choice', () => {
    renderAtPath(<RedirectProbe />, '/');

    expect(getCurrentLocation()).toHaveTextContent(/^\/$/);
  });

  it('stays on the root when Czech was chosen', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'cs');

    renderAtPath(<RedirectProbe />, '/');

    expect(getCurrentLocation()).toHaveTextContent(/^\/$/);
  });

  it('never overrides a locale already in the URL', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en');

    renderAtPath(<RedirectProbe />, '/sk');

    expect(getCurrentLocation()).toHaveTextContent('/sk');
  });
});
