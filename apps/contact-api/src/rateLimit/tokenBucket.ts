export type RateLimitDecision = {
  isAllowed: boolean;
  retryAfterSeconds: number;
};

export type RateLimiter = {
  take: (key: string) => RateLimitDecision;
};

export type TokenBucketOptions = {
  capacity: number;
  refillIntervalMs: number;
  maxTrackedKeys: number;
  now: () => number;
};

type Bucket = {
  tokens: number;
  updatedAt: number;
};

const MS_PER_SECOND = 1000;

// In memory, per process: the API runs as a single container, so no shared store is needed.
export function createTokenBucketLimiter({
  capacity,
  refillIntervalMs,
  maxTrackedKeys,
  now,
}: TokenBucketOptions): RateLimiter {
  // Map order is least recently used first: every take moves its key to the end, so a full
  // table drops the client idle the longest in O(1). Under a flood of fresh addresses that
  // may forget a limited client early, but memory stays bounded.
  const buckets = new Map<string, Bucket>();

  const refill = (bucket: Bucket, at: number): Bucket => ({
    tokens: Math.min(
      capacity,
      bucket.tokens + (at - bucket.updatedAt) / refillIntervalMs,
    ),
    updatedAt: at,
  });

  const store = (key: string, bucket: Bucket) => {
    buckets.delete(key);

    if (buckets.size >= maxTrackedKeys) {
      const leastRecentKey = buckets.keys().next().value;
      if (leastRecentKey !== undefined) buckets.delete(leastRecentKey);
    }

    buckets.set(key, bucket);
  };

  return {
    take(key) {
      const at = now();
      const bucket = refill(
        buckets.get(key) ?? { tokens: capacity, updatedAt: at },
        at,
      );

      if (bucket.tokens < 1) {
        store(key, bucket);

        return {
          isAllowed: false,
          retryAfterSeconds: Math.ceil(
            ((1 - bucket.tokens) * refillIntervalMs) / MS_PER_SECOND,
          ),
        };
      }

      store(key, { ...bucket, tokens: bucket.tokens - 1 });

      return { isAllowed: true, retryAfterSeconds: 0 };
    },
  };
}
