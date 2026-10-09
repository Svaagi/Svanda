import { CLIENT_ERROR_REPORT_LIMIT } from 'constants/analytics';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindClientErrorReporting } from './clientErrors';
import { hashMessage } from './hashMessage';

const fireError = (message: string) =>
  window.dispatchEvent(new ErrorEvent('error', { message }));

function fireRejection(reason: unknown) {
  const event = new Event('unhandledrejection');
  Object.assign(event, { reason });
  window.dispatchEvent(event);
}

describe('bindClientErrorReporting', () => {
  let stop = () => {};

  afterEach(() => stop());

  it('reports errors and rejections as message hashes only', () => {
    const report = vi.fn();
    stop = bindClientErrorReporting(window, report);

    fireError('Script error at jana@example.com');
    fireRejection(new Error('Failed to fetch'));
    fireRejection('plain reason');

    expect(report.mock.calls).toEqual([
      [
        {
          kind: 'error',
          hash: hashMessage('Script error at jana@example.com'),
        },
      ],
      [{ kind: 'rejection', hash: hashMessage('Failed to fetch') }],
      [{ kind: 'rejection', hash: hashMessage('plain reason') }],
    ]);
  });

  it('reports each error once and caps the total per page', () => {
    const report = vi.fn();
    stop = bindClientErrorReporting(window, report);

    fireError('same');
    fireError('same');
    for (let i = 0; i < CLIENT_ERROR_REPORT_LIMIT * 2; i++) fireError(`e${i}`);

    expect(report).toHaveBeenCalledTimes(CLIENT_ERROR_REPORT_LIMIT);
  });

  it('stops reporting when unbound', () => {
    const report = vi.fn();
    bindClientErrorReporting(window, report)();

    fireError('after');

    expect(report).not.toHaveBeenCalled();
  });
});
