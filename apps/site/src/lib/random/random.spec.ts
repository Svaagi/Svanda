import { describe, expect, it } from 'vitest';

import { hash3, mulberry32 } from './random';

const take = (next: () => number, count: number) =>
  Array.from({ length: count }, () => next());

describe('mulberry32', () => {
  it('matches the reference sequence for a seed', () => {
    expect(take(mulberry32(7), 3)).toEqual([
      0.011704753153026104, 0.06195825757458806, 0.97690763277933,
    ]);
  });

  it('repeats the same sequence for the same seed', () => {
    expect(take(mulberry32(42), 50)).toEqual(take(mulberry32(42), 50));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(mulberry32(1), 5)).not.toEqual(take(mulberry32(2), 5));
  });

  it('stays within 0..1', () => {
    take(mulberry32(3), 1000).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });
});

describe('hash3', () => {
  it('matches the reference values', () => {
    expect(hash3(1, 2, 3)).toBe(0.5767206135205925);
    expect(hash3(5, 9, 77)).toBe(0.44913849025033414);
  });

  it('is stable and sensitive to every argument', () => {
    expect(hash3(4, 5, 6)).toBe(hash3(4, 5, 6));
    expect(hash3(4, 5, 6)).not.toBe(hash3(5, 5, 6));
    expect(hash3(4, 5, 6)).not.toBe(hash3(4, 6, 6));
    expect(hash3(4, 5, 6)).not.toBe(hash3(4, 5, 7));
  });
});
