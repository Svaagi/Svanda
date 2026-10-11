import {
  CONSENT_COOKIE_DAYS,
  CONSENT_COOKIE_NAME,
  CONSENT_REVISION,
} from 'constants/consent';
import { LOCALES } from 'constants/locales';
import type { CookieValue } from 'vanilla-cookieconsent';
import { describe, expect, it, vi } from 'vitest';

import { buildConsentConfig, isConsentCategory } from './consentConfig';

function buildConfig() {
  const options = {
    locale: 'en' as const,
    onChoice: vi.fn(),
    onModalReady: vi.fn(),
  };

  return { options, config: buildConsentConfig(options) };
}

describe('buildConsentConfig', () => {
  it('keeps necessary on, analytics on until objected to, marketing off', () => {
    const { config } = buildConfig();

    expect(config.mode).toBe('opt-out');
    expect(config.categories).toEqual({
      necessary: { enabled: true, readOnly: true },
      analytics: { enabled: true },
      marketing: { enabled: false },
    });
  });

  it('stores the choice in the cookie the cookie policy names', () => {
    const { config } = buildConfig();

    expect(config.revision).toBe(CONSENT_REVISION);
    expect(config.cookie).toEqual({
      name: CONSENT_COOKIE_NAME,
      expiresAfterDays: CONSENT_COOKIE_DAYS,
    });
  });

  it('starts in the page locale with every locale translated', () => {
    const { config } = buildConfig();

    expect(config.language.default).toBe('en');
    expect(Object.keys(config.language.translations)).toEqual([...LOCALES]);
  });

  it('reports every choice and every rendered modal', () => {
    const { config, options } = buildConfig();
    const cookie = {} as CookieValue;
    const modal = document.createElement('div');

    config.onConsent?.({ cookie });
    config.onChange?.({ cookie, changedCategories: [], changedServices: {} });
    config.onModalReady?.({ modalName: 'consentModal', modal });

    expect(options.onChoice).toHaveBeenCalledTimes(2);
    expect(options.onModalReady).toHaveBeenCalledWith('consentModal', modal);
  });
});

describe('isConsentCategory', () => {
  it('accepts only known categories', () => {
    expect(isConsentCategory('marketing')).toBe(true);
    expect(isConsentCategory('ads')).toBe(false);
  });
});
