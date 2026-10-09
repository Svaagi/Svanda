import { describe, expect, it } from 'vitest';

import { toStageViewport } from './useStageViewport';

describe('toStageViewport', () => {
  it('is desktop landscape from the mobile breakpoint up', () => {
    expect(toStageViewport(1040, 800)).toEqual({
      width: 1040,
      height: 800,
      isMobile: false,
      isPortrait: false,
    });
  });

  it('is mobile below the breakpoint and portrait when taller than wide', () => {
    expect(toStageViewport(1039, 1200)).toMatchObject({
      isMobile: true,
      isPortrait: true,
    });
  });
});
