import { ANALYTICS_QUEUE_LIMIT } from 'constants/analytics';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  attachTracker,
  resetAnalyticsClient,
  setAnalyticsStatus,
  track,
  trackPageView,
} from './analyticsClient';
import type { UmamiPayload, UmamiTracker } from './umamiTracker';

const DEFAULT_PAYLOAD = { website: 'site-id', url: '/stale' };

function createTracker() {
  const sent: UmamiPayload[] = [];
  const tracker: UmamiTracker = {
    track: vi.fn((buildPayload: (payload: UmamiPayload) => UmamiPayload) => {
      sent.push(buildPayload(DEFAULT_PAYLOAD));
    }),
  };
  return { tracker, sent };
}

describe('analytics client', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/en');
    document.title = 'SVANDA';
  });

  afterEach(() => {
    resetAnalyticsClient();
    window.history.replaceState(null, '', '/');
  });

  it('sends a typed event with the current page once tracking is on', () => {
    const { tracker, sent } = createTracker();
    setAnalyticsStatus('on');
    attachTracker(tracker);

    track('theme_change', { theme: 'light' });

    expect(sent).toEqual([
      {
        website: 'site-id',
        url: '/en',
        title: 'SVANDA',
        name: 'theme_change',
        data: { theme: 'light' },
      },
    ]);
  });

  it('sends events without properties and page views without a name', () => {
    const { tracker, sent } = createTracker();
    setAnalyticsStatus('on');
    attachTracker(tracker);

    track('contact_submit_success');
    trackPageView();

    expect(sent[0]).toEqual(
      expect.objectContaining({ name: 'contact_submit_success' }),
    );
    expect(sent[0]).not.toHaveProperty('data');
    expect(sent[1]).toEqual({
      ...DEFAULT_PAYLOAD,
      url: '/en',
      title: 'SVANDA',
    });
  });

  it('queues calls until consent is known and the tracker has loaded', () => {
    const { tracker, sent } = createTracker();
    trackPageView();
    window.history.replaceState(null, '', '/sk');
    track('cta_click', { target: 'hero' });

    attachTracker(tracker);
    expect(sent).toHaveLength(0);
    setAnalyticsStatus('on');

    // Each call keeps the page it was made on.
    expect(sent.map(({ url }) => url)).toEqual(['/en', '/sk']);
  });

  it('drops queued and later calls when tracking is turned off', () => {
    const { tracker, sent } = createTracker();
    attachTracker(tracker);
    trackPageView();

    setAnalyticsStatus('off');
    track('cta_click', { target: 'hero' });
    setAnalyticsStatus('on');

    expect(sent).toHaveLength(0);
  });

  it('stops sending when consent is withdrawn after tracking started', () => {
    const { tracker, sent } = createTracker();
    setAnalyticsStatus('on');
    attachTracker(tracker);
    track('cta_click', { target: 'hero' });

    setAnalyticsStatus('off');
    track('cta_click', { target: 'hero' });
    trackPageView();

    expect(sent).toHaveLength(1);
  });

  it('holds at most the queue limit while waiting', () => {
    const { tracker, sent } = createTracker();
    for (let i = 0; i <= ANALYTICS_QUEUE_LIMIT; i++) trackPageView();

    setAnalyticsStatus('on');
    attachTracker(tracker);

    expect(sent).toHaveLength(ANALYTICS_QUEUE_LIMIT);
  });

  it('accepts only the properties the catalogue gives each event', () => {
    // Compile-time checks (`pnpm typecheck`): each call fails without its directive.
    const typeChecks = () => {
      // @ts-expect-error unknown event
      track('page_scroll');
      // @ts-expect-error missing properties
      track('cta_click');
      // @ts-expect-error wrong property value
      track('theme_change', { theme: 'blue' });
      // @ts-expect-error free text never goes to analytics
      track('contact_submit_error', { code: 'contact.invalid', message: 'x' });
      // @ts-expect-error an event without properties takes none
      track('contact_submit_success', {});
    };

    expect(typeChecks).toBeTypeOf('function');
  });
});
