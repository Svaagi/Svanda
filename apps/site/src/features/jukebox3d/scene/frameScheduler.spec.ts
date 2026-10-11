import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFrameScheduler } from './frameScheduler';

describe('createFrameScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invalidates at once for a moving scene', () => {
    const invalidate = vi.fn();
    createFrameScheduler(invalidate, 33).request('now');

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('keeps a single idle timer however often an idle frame is asked for', () => {
    const invalidate = vi.fn();
    const scheduler = createFrameScheduler(invalidate, 33);

    scheduler.request('idle');
    scheduler.request('idle');
    expect(vi.getTimerCount()).toBe(1);
    expect(invalidate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(33);
    expect(invalidate).toHaveBeenCalledTimes(1);

    scheduler.request('idle');
    expect(vi.getTimerCount()).toBe(1);
  });

  it('asks for nothing when the scene is still', () => {
    const invalidate = vi.fn();
    createFrameScheduler(invalidate, 33).request('none');

    expect(vi.getTimerCount()).toBe(0);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('drops a pending idle frame when cancelled', () => {
    const invalidate = vi.fn();
    const scheduler = createFrameScheduler(invalidate, 33);

    scheduler.request('idle');
    scheduler.cancel();
    vi.advanceTimersByTime(100);

    expect(vi.getTimerCount()).toBe(0);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
