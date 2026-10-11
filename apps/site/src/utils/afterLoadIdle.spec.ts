import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { afterLoadIdle } from './afterLoadIdle';

const TIMEOUT_MS = 2000;

const setReadyState = (state: DocumentReadyState) =>
  vi.spyOn(document, 'readyState', 'get').mockReturnValue(state);

describe('afterLoadIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('waits for the load event, then for an idle callback with the timeout', () => {
    setReadyState('interactive');
    const requestIdleCallback = vi.fn(() => 1);
    vi.stubGlobal('requestIdleCallback', requestIdleCallback);
    const callback = vi.fn();

    afterLoadIdle(callback, TIMEOUT_MS);
    expect(requestIdleCallback).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
    expect(requestIdleCallback).toHaveBeenCalledWith(callback, {
      timeout: TIMEOUT_MS,
    });
  });

  it('schedules at once when the page has already loaded', () => {
    setReadyState('complete');
    const requestIdleCallback = vi.fn(() => 1);
    vi.stubGlobal('requestIdleCallback', requestIdleCallback);

    afterLoadIdle(vi.fn(), TIMEOUT_MS);

    expect(requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it('falls back to a timeout without requestIdleCallback', () => {
    setReadyState('complete');
    vi.stubGlobal('requestIdleCallback', undefined);
    const callback = vi.fn();

    afterLoadIdle(callback, TIMEOUT_MS);
    expect(callback).not.toHaveBeenCalled();
    vi.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending idle callback and the load listener', () => {
    setReadyState('interactive');
    const requestIdleCallback = vi.fn(() => 1);
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal('requestIdleCallback', requestIdleCallback);
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback);

    const cancel = afterLoadIdle(vi.fn(), TIMEOUT_MS);
    cancel();
    window.dispatchEvent(new Event('load'));
    expect(requestIdleCallback).not.toHaveBeenCalled();

    setReadyState('complete');
    afterLoadIdle(vi.fn(), TIMEOUT_MS)();
    expect(cancelIdleCallback).toHaveBeenCalledWith(1);
  });
});
