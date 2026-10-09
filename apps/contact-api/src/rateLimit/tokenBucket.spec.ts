import { describe, expect, it } from 'vitest';

import { createTokenBucketLimiter } from './tokenBucket.js';

const REFILL_MS = 60_000;

function setup(capacity = 2, maxTrackedKeys = 100) {
  let time = 0;
  const limiter = createTokenBucketLimiter({
    capacity,
    refillIntervalMs: REFILL_MS,
    maxTrackedKeys,
    now: () => time,
  });

  return {
    limiter,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

describe('createTokenBucketLimiter', () => {
  it('allows a burst up to the capacity, then refuses', () => {
    const { limiter } = setup();

    expect(limiter.take('ip').isAllowed).toBe(true);
    expect(limiter.take('ip').isAllowed).toBe(true);
    expect(limiter.take('ip')).toEqual({
      isAllowed: false,
      retryAfterSeconds: 60,
    });
  });

  it('refills one token per interval', () => {
    const { limiter, advance } = setup();
    limiter.take('ip');
    limiter.take('ip');

    advance(REFILL_MS / 2);
    expect(limiter.take('ip')).toEqual({
      isAllowed: false,
      retryAfterSeconds: 30,
    });

    advance(REFILL_MS / 2);
    expect(limiter.take('ip').isAllowed).toBe(true);
    expect(limiter.take('ip').isAllowed).toBe(false);
  });

  it('keeps a bucket per key', () => {
    const { limiter } = setup(1);

    expect(limiter.take('first').isAllowed).toBe(true);
    expect(limiter.take('first').isAllowed).toBe(false);
    expect(limiter.take('second').isAllowed).toBe(true);
  });

  it('caps the table, dropping the least recently used client', () => {
    const { limiter } = setup(1, 2);
    limiter.take('a');
    limiter.take('b');
    limiter.take('a');

    limiter.take('c');

    expect(limiter.take('a').isAllowed).toBe(false);
    expect(limiter.take('b').isAllowed).toBe(true);
  });

  it('stays bounded under a flood of fresh keys', () => {
    const { limiter } = setup(1, 3);
    limiter.take('victim');

    for (let i = 0; i < 1000; i++) limiter.take(`flood-${i}`);

    expect(limiter.take('flood-999').isAllowed).toBe(false);
    expect(limiter.take('victim').isAllowed).toBe(true);
  });
});
