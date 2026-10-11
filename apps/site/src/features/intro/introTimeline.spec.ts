import {
  INTRO_LOGO_LAND_S,
  INTRO_PIXELS_END_S,
  INTRO_READY_S,
} from 'constants/intro';
import { describe, expect, it } from 'vitest';

import { coverAlphaAt, introPhaseAt, introVarsAt } from './introTimeline';

describe('introPhaseAt', () => {
  it.each([
    [0, 'pixels'],
    [INTRO_PIXELS_END_S - 0.01, 'pixels'],
    [INTRO_PIXELS_END_S, 'swarm'],
    [INTRO_LOGO_LAND_S - 0.01, 'swarm'],
    [INTRO_LOGO_LAND_S, 'reveal'],
    [INTRO_READY_S - 0.01, 'reveal'],
    [INTRO_READY_S, 'done'],
    [60, 'done'],
  ])('at %ss is %s', (t, phase) => {
    expect(introPhaseAt(t)).toBe(phase);
  });
});

describe('introVarsAt', () => {
  it('hides the whole header and hero at the start', () => {
    expect(introVarsAt(0)).toEqual({
      '--sv-nav': '0.000',
      '--sv-menu': '0.000',
      '--sv-logo': '0',
      '--sv-hero': '0.000',
    });
  });

  it('slides the nav in from 3.8s to 4.3s', () => {
    expect(introVarsAt(3.8)['--sv-nav']).toBe('0.000');
    expect(introVarsAt(4.05)['--sv-nav']).toBe('0.500');
    expect(introVarsAt(4.3)['--sv-nav']).toBe('1.000');
  });

  it('reveals the menu from 4.4s to 5.2s and the hero from 5.6s to 6.3s', () => {
    expect(introVarsAt(4.8)['--sv-menu']).toBe('0.500');
    expect(introVarsAt(5.2)['--sv-menu']).toBe('1.000');
    expect(introVarsAt(5.6)['--sv-hero']).toBe('0.000');
    expect(introVarsAt(5.95)['--sv-hero']).toBe('0.500');
    expect(introVarsAt(6.3)['--sv-hero']).toBe('1.000');
  });

  it('swaps the DOM logo in when the swarm lands', () => {
    expect(introVarsAt(INTRO_LOGO_LAND_S - 0.001)['--sv-logo']).toBe('0');
    expect(introVarsAt(INTRO_LOGO_LAND_S)['--sv-logo']).toBe('1');
  });

  it('ends on the final values global.css also defaults to', () => {
    expect(introVarsAt(INTRO_READY_S)).toEqual({
      '--sv-nav': '1.000',
      '--sv-menu': '1.000',
      '--sv-logo': '1',
      '--sv-hero': '1.000',
    });
  });
});

describe('coverAlphaAt', () => {
  it('stays solid until 4.6s and fades out by 5.5s', () => {
    expect(coverAlphaAt(0)).toBe(1);
    expect(coverAlphaAt(4.6)).toBe(1);
    expect(coverAlphaAt(5.05)).toBeCloseTo(0.5);
    expect(coverAlphaAt(5.5)).toBe(0);
    expect(coverAlphaAt(INTRO_READY_S)).toBe(0);
  });
});
