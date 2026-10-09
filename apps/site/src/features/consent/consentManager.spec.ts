import { afterEach, describe, expect, it, vi } from 'vitest';

const cookieConsent = vi.hoisted(() => ({
  run: vi.fn(() => Promise.resolve()),
  setLanguage: vi.fn(() => Promise.resolve(true)),
  showPreferences: vi.fn(),
  getUserPreferences: vi.fn(() => ({
    acceptedCategories: ['necessary', 'analytics', 'unknown'],
  })),
}));

vi.mock('./cookieConsentClient', () => ({ CookieConsent: cookieConsent }));

// The manager is a page-wide singleton, so every test starts from fresh modules.
async function loadManager() {
  vi.resetModules();
  const manager = await import('./consentManager');
  const { useConsentStore } = await import('./consentStore');

  return { ...manager, useConsentStore };
}

describe('consent manager', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts once in the page locale and publishes the known categories', async () => {
    const { syncConsentManager, useConsentStore } = await loadManager();

    syncConsentManager('sk');

    await vi.waitFor(() =>
      expect(useConsentStore.getState().acceptedCategories).toEqual([
        'necessary',
        'analytics',
      ]),
    );
    expect(cookieConsent.run).toHaveBeenCalledTimes(1);
    expect(cookieConsent.run).toHaveBeenCalledWith(
      expect.objectContaining({
        language: expect.objectContaining({ default: 'sk' }),
      }),
    );
  });

  it('switches the language instead of starting again', async () => {
    const { syncConsentManager } = await loadManager();

    syncConsentManager('cs');
    syncConsentManager('en');

    await vi.waitFor(() =>
      expect(cookieConsent.setLanguage).toHaveBeenCalledWith('en'),
    );
    expect(cookieConsent.run).toHaveBeenCalledTimes(1);
  });

  it('starts again on the next call after a failed start', async () => {
    const { openCookieSettings, syncConsentManager } = await loadManager();
    cookieConsent.run.mockRejectedValueOnce(new Error('chunk failed'));

    syncConsentManager('cs');
    openCookieSettings();
    await vi.waitFor(() => expect(cookieConsent.run).toHaveBeenCalledTimes(1));
    // Let the failed start settle and reset the manager.
    await new Promise((resolve) => setTimeout(resolve, 0));
    syncConsentManager('en');

    await vi.waitFor(() => expect(cookieConsent.run).toHaveBeenCalledTimes(2));
    expect(cookieConsent.run).toHaveBeenLastCalledWith(
      expect.objectContaining({
        language: expect.objectContaining({ default: 'en' }),
      }),
    );
    expect(cookieConsent.setLanguage).not.toHaveBeenCalled();
    expect(cookieConsent.showPreferences).not.toHaveBeenCalled();
  });

  it('opens the preferences only once started', async () => {
    const { openCookieSettings, syncConsentManager } = await loadManager();

    openCookieSettings();
    syncConsentManager('cs');
    openCookieSettings();

    await vi.waitFor(() =>
      expect(cookieConsent.showPreferences).toHaveBeenCalledTimes(1),
    );
  });
});
