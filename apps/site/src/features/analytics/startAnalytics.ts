import { subscribeConsent, whenConsented } from 'features/consent';
import {
  attachTracker,
  bindClientErrorReporting,
  loadUmamiScript,
  reportWebVitals,
  setAnalyticsStatus,
  track,
  type UmamiConfig,
} from 'lib/analytics';

import { analyticsStatusFor } from './analyticsStatus';
import { trackSectionViews } from './sectionViews';

// Tracker loads only after analytics consent; returns a stop function.
export function startAnalytics(
  config: UmamiConfig | null,
  isDoNotTrack: boolean,
): () => void {
  if (!config || isDoNotTrack) {
    setAnalyticsStatus('off');
    return () => {};
  }

  const stopConsent = subscribeConsent((categories) =>
    setAnalyticsStatus(analyticsStatusFor(categories)),
  );
  const cancelTracker = whenConsented('analytics', () =>
    loadUmamiScript(config, attachTracker),
  );
  const stopErrors = bindClientErrorReporting(window, (event) =>
    track('client_error', event),
  );
  const stopSections = trackSectionViews();
  // A failed chunk load only means no vitals; nothing else depends on it.
  reportWebVitals((event) => track('web_vital', event)).catch(() => {});

  return () => {
    stopConsent();
    cancelTracker();
    stopErrors();
    stopSections();
  };
}
