import {
  BOTTOM_SHEET_DURATION_S,
  DIALOG_DURATION_S,
  DIALOG_OFFSET_PX,
} from 'constants/motion';
import { describe, expect, it } from 'vitest';

import { getContentMotion, getOverlayMotion } from './dialogMotion';

describe('dialog motion', () => {
  it('fades the overlay and slides the content in', () => {
    expect(getOverlayMotion(false).transition.duration).toBe(DIALOG_DURATION_S);
    expect(getContentMotion(false).initial).toEqual({
      opacity: 0,
      y: DIALOG_OFFSET_PX,
    });
    expect(getContentMotion(false).animate).toEqual({ opacity: 1, y: 0 });
  });

  it('slides a bottom sheet up from below the viewport edge', () => {
    const motion = getContentMotion(false, true);

    expect(motion.initial).toEqual({ opacity: 1, y: '100%' });
    expect(motion.animate).toEqual({ opacity: 1, y: 0 });
    expect(motion.exit).toEqual(motion.initial);
    expect(motion.transition.duration).toBe(BOTTOM_SHEET_DURATION_S);
  });

  it('shows everything instantly without movement under reduced motion', () => {
    for (const motion of [
      getOverlayMotion(true),
      getContentMotion(true),
      getContentMotion(true, true),
    ]) {
      expect(motion.transition.duration).toBe(0);
      expect(motion.initial).not.toHaveProperty('y');
    }
  });
});
