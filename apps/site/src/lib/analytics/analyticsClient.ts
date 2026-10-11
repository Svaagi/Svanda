import { ANALYTICS_QUEUE_LIMIT } from 'constants/analytics';

import type { AnalyticsEventArgs, AnalyticsEventName } from './analyticsEvents';
import type { UmamiTracker } from './umamiTracker';

// `pending` until the visitor's consent choice is known, then `on` or `off`. Calls made while
// pending wait in the queue; turning off drops them and every later call.
export type AnalyticsStatus = 'pending' | 'on' | 'off';

type EventCall = { name?: string; data?: object };
type Call = EventCall & { url: string; title: string };

let status: AnalyticsStatus = 'pending';
let tracker: UmamiTracker | null = null;
let queue: Call[] = [];

function send(call: Call, to: UmamiTracker) {
  // The tracker keeps the URL it loaded on (automatic tracking is off), so each call names
  // the page it belongs to.
  to.track((payload) => ({ ...payload, ...call }));
}

function flush() {
  if (status !== 'on' || !tracker) return;
  const pending = queue;
  queue = [];
  for (const call of pending) send(call, tracker);
}

function enqueue(call: EventCall) {
  if (status === 'off' || typeof window === 'undefined') return;
  const page = { url: window.location.pathname, title: document.title };
  if (status === 'on' && tracker) {
    send({ ...page, ...call }, tracker);
    return;
  }
  if (queue.length < ANALYTICS_QUEUE_LIMIT) queue.push({ ...page, ...call });
}

export function setAnalyticsStatus(next: AnalyticsStatus) {
  status = next;
  if (next === 'off') queue = [];
  flush();
}

export function attachTracker(next: UmamiTracker) {
  tracker = next;
  flush();
}

export function track<Event extends AnalyticsEventName>(
  event: Event,
  ...[data]: AnalyticsEventArgs<Event>
) {
  enqueue(data === undefined ? { name: event } : { name: event, data });
}

// A page view of the current route; the path carries the locale (`/`, `/en`, `/sk/...`).
export function trackPageView() {
  enqueue({});
}

// Specs only: back to the state of a fresh page.
export function resetAnalyticsClient() {
  status = 'pending';
  tracker = null;
  queue = [];
}
