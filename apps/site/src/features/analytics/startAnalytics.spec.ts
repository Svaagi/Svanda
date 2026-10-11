import type { ConsentCategory } from 'constants/consent';
import { CONTACT_PAGE } from 'constants/stage';
import { useConsentStore } from 'features/consent/consentStore';
import { useStageStore } from 'features/stage';
import { track, trackPageView } from 'lib/analytics';
import { resetAnalyticsClient } from 'lib/analytics/analyticsClient';
import type { UmamiPayload } from 'lib/analytics/umamiTracker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startAnalytics } from './startAnalytics';

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
}));

const CONFIG = { src: 'https://stats.example/script.js', websiteId: 'id' };

const sent: UmamiPayload[] = [];

const trackerScript = () =>
  document.head.querySelector<HTMLScriptElement>(`script[src="${CONFIG.src}"]`);

function loadTracker() {
  window.umami = {
    track: (buildPayload) => sent.push(buildPayload({})),
  };
  trackerScript()?.dispatchEvent(new Event('load'));
}

const setConsent = (categories: ConsentCategory[]) =>
  useConsentStore.getState().setAcceptedCategories(categories);

describe('startAnalytics', () => {
  let stop = () => {};

  beforeEach(() => {
    sent.length = 0;
  });

  afterEach(() => {
    stop();
    resetAnalyticsClient();
    setConsent([]);
    useStageStore.setState({ page: 0 });
    delete window.umami;
    document.head.innerHTML = '';
  });

  it('never loads the tracker under Do Not Track', () => {
    stop = startAnalytics(CONFIG, true);
    setConsent(['necessary', 'analytics']);

    expect(trackerScript()).toBeNull();
  });

  it('sends nothing without a tracker configuration', () => {
    stop = startAnalytics(null, false);
    setConsent(['necessary', 'analytics']);
    trackPageView();
    window.umami = { track: (buildPayload) => sent.push(buildPayload({})) };

    expect(trackerScript()).toBeNull();
    expect(sent).toHaveLength(0);
  });

  it('loads the tracker on consent, sends what waited and stops on withdrawal', () => {
    stop = startAnalytics(CONFIG, false);
    trackPageView();
    expect(trackerScript()).toBeNull();

    setConsent(['necessary', 'analytics']);
    loadTracker();
    expect(sent).toHaveLength(1);
    expect(sent[0]).not.toHaveProperty('name');

    useStageStore.setState({ page: CONTACT_PAGE });
    expect(sent.at(-1)).toEqual(
      expect.objectContaining({
        name: 'section_view',
        data: { section: 'contact' },
      }),
    );

    setConsent(['necessary']);
    track('cta_click', { target: 'hero' });
    trackPageView();
    window.dispatchEvent(new ErrorEvent('error', { message: 'boom' }));
    expect(sent).toHaveLength(2);
  });

  it('reports uncaught errors as hashes while consented', () => {
    stop = startAnalytics(CONFIG, false);
    setConsent(['necessary', 'analytics']);
    loadTracker();

    window.dispatchEvent(new ErrorEvent('error', { message: 'secret text' }));

    expect(sent).toEqual([
      expect.objectContaining({
        name: 'client_error',
        data: { kind: 'error', hash: expect.stringMatching(/^[0-9a-f]{8}$/) },
      }),
    ]);
    expect(JSON.stringify(sent)).not.toContain('secret');
  });

  it('drops waiting calls when the stored choice declines analytics', () => {
    stop = startAnalytics(CONFIG, false);
    trackPageView();

    setConsent(['necessary']);
    setConsent(['necessary', 'analytics']);
    loadTracker();

    expect(sent).toHaveLength(0);
  });
});
