import { NAV_REVEAL_DELAY_NEAR } from 'constants/nav';
import { describe, expect, it } from 'vitest';

import { navRevealStyle } from './navReveal';

describe('navRevealStyle', () => {
  it('hands the reveal start point to CSS as a custom property', () => {
    expect(navRevealStyle(NAV_REVEAL_DELAY_NEAR)).toEqual({
      '--nav-reveal-delay': NAV_REVEAL_DELAY_NEAR,
    });
  });
});
