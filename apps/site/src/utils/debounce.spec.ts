import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

const WAIT_MS = 100;

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs once with the latest arguments after a quiet period', () => {
    const run = vi.fn();
    const debounced = debounce(run, WAIT_MS);

    debounced(1);
    vi.advanceTimersByTime(WAIT_MS - 1);
    debounced(2);
    vi.advanceTimersByTime(WAIT_MS - 1);
    expect(run).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledOnce();
    expect(run).toHaveBeenCalledWith(2);
  });

  it('flushes a pending call at once and only once', () => {
    const run = vi.fn();
    const debounced = debounce(run, WAIT_MS);

    debounced('now');
    debounced.flush();
    debounced.flush();
    vi.advanceTimersByTime(WAIT_MS);

    expect(run).toHaveBeenCalledOnce();
    expect(run).toHaveBeenCalledWith('now');
  });

  it('drops a pending call when cancelled', () => {
    const run = vi.fn();
    const debounced = debounce(run, WAIT_MS);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(WAIT_MS);

    expect(run).not.toHaveBeenCalled();
  });
});
