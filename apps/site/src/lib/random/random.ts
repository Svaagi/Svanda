/* eslint-disable @typescript-eslint/no-magic-numbers -- published mixing constants */
const UINT32_RANGE = 4294967296;

// mulberry32: a tiny seeded PRNG, so the intro grid is the same on every visit.
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

// A stateless 0..1 hash of three integers: per-cell randomness without stored state.
export function hash3(a: number, b: number, c: number): number {
  let mixed = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  mixed = Math.imul(mixed ^ (mixed >>> 13), 1274126177);
  return ((mixed ^ (mixed >>> 16)) >>> 0) / UINT32_RANGE;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
