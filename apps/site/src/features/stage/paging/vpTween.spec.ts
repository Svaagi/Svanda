import { VP_TWEEN_DURATION_MS } from 'constants/stage';
import { describe, expect, it } from 'vitest';

import { formatVp, tweenVp } from './vpTween';

describe('tweenVp', () => {
  it('starts at the origin and ends on the target page', () => {
    expect(tweenVp(1, 3, 0)).toBe(1);
    expect(tweenVp(1, 3, VP_TWEEN_DURATION_MS)).toBe(3);
  });

  it('eases in and out around the halfway point', () => {
    expect(tweenVp(0, 1, VP_TWEEN_DURATION_MS / 2)).toBeCloseTo(0.5);
    expect(tweenVp(0, 1, VP_TWEEN_DURATION_MS / 4)).toBeCloseTo(0.125);
  });

  it('clamps before the start and after the end', () => {
    expect(tweenVp(2, 4, -100)).toBe(2);
    expect(tweenVp(2, 4, VP_TWEEN_DURATION_MS * 3)).toBe(4);
  });

  it('works backwards', () => {
    expect(tweenVp(4, 0, VP_TWEEN_DURATION_MS / 2)).toBeCloseTo(2);
  });
});

describe('formatVp', () => {
  it('writes four decimals', () => {
    expect(formatVp(1.234567)).toBe('1.2346');
    expect(formatVp(2)).toBe('2.0000');
  });
});
