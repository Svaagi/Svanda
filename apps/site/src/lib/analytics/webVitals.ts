import { CLS_DECIMALS } from 'constants/analytics';
import { roundTo } from 'lib/math';
import type { CLSMetric, INPMetric, LCPMetric } from 'web-vitals';

import type { AnalyticsEvents } from './analyticsEvents';

type WebVitalMetric = Pick<
  CLSMetric | INPMetric | LCPMetric,
  'name' | 'value' | 'rating'
>;

type WebVitalEvent = AnalyticsEvents['web_vital'];

export function toWebVitalEvent({
  name,
  value,
  rating,
}: WebVitalMetric): WebVitalEvent {
  return {
    metric: name,
    value: name === 'CLS' ? roundTo(value, CLS_DECIMALS) : Math.round(value),
    rating,
  };
}

let hasStarted = false;

// The library may observe each metric only once per page, so this registers at most once.
// It loads on demand, keeping it out of the initial bundle.
export async function reportWebVitals(report: (event: WebVitalEvent) => void) {
  if (hasStarted) return;
  hasStarted = true;
  const { onCLS, onINP, onLCP } = await import('web-vitals');
  const handleMetric = (metric: WebVitalMetric) =>
    report(toWebVitalEvent(metric));
  onCLS(handleMetric);
  onINP(handleMetric);
  onLCP(handleMetric);
}
