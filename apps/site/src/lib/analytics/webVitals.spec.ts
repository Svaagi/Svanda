import { describe, expect, it, vi } from 'vitest';
import type { Metric } from 'web-vitals';

import { reportWebVitals, toWebVitalEvent } from './webVitals';

type MetricCallback = (metric: Metric) => void;

const callbacks = vi.hoisted(() => new Map<string, MetricCallback>());

vi.mock('web-vitals', () => ({
  onCLS: (callback: MetricCallback) => callbacks.set('CLS', callback),
  onINP: (callback: MetricCallback) => callbacks.set('INP', callback),
  onLCP: (callback: MetricCallback) => callbacks.set('LCP', callback),
}));

describe('toWebVitalEvent', () => {
  it('rounds time metrics to whole ms and CLS to three decimals', () => {
    expect(
      toWebVitalEvent({ name: 'LCP', value: 1234.56, rating: 'good' }),
    ).toEqual({ metric: 'LCP', value: 1235, rating: 'good' });
    expect(
      toWebVitalEvent({
        name: 'CLS',
        value: 0.123456,
        rating: 'needs-improvement',
      }),
    ).toEqual({ metric: 'CLS', value: 0.123, rating: 'needs-improvement' });
  });
});

describe('reportWebVitals', () => {
  it('reports LCP, INP and CLS, registering only once', async () => {
    const report = vi.fn();
    await reportWebVitals(report);
    await reportWebVitals(vi.fn());

    expect([...callbacks.keys()].sort()).toEqual(['CLS', 'INP', 'LCP']);
    callbacks.get('INP')?.({
      name: 'INP',
      value: 88.4,
      rating: 'poor',
    } as Metric);

    expect(report).toHaveBeenCalledOnce();
    expect(report).toHaveBeenCalledWith({
      metric: 'INP',
      value: 88,
      rating: 'poor',
    });
  });
});
