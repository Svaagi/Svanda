import { CLIENT_ERROR_REPORT_LIMIT } from 'constants/analytics';

import type { AnalyticsEvents } from './analyticsEvents';
import { hashMessage } from './hashMessage';

type ClientErrorEvent = AnalyticsEvents['client_error'];

const reasonMessage = (reason: unknown): string =>
  reason instanceof Error ? reason.message : String(reason);

// Reports uncaught errors and unhandled rejections as hashes of their message, each distinct
// one once per page load. Returns a function that stops reporting.
export function bindClientErrorReporting(
  target: Window,
  report: (event: ClientErrorEvent) => void,
): () => void {
  const reported = new Set<string>();

  const reportOnce = (kind: ClientErrorEvent['kind'], message: string) => {
    const hash = hashMessage(message);
    if (reported.has(hash) || reported.size >= CLIENT_ERROR_REPORT_LIMIT)
      return;
    reported.add(hash);
    report({ kind, hash });
  };

  const handleError = (event: ErrorEvent) => reportOnce('error', event.message);
  const handleRejection = (event: PromiseRejectionEvent) =>
    reportOnce('rejection', reasonMessage(event.reason));

  target.addEventListener('error', handleError);
  target.addEventListener('unhandledrejection', handleRejection);

  return () => {
    target.removeEventListener('error', handleError);
    target.removeEventListener('unhandledrejection', handleRejection);
  };
}
