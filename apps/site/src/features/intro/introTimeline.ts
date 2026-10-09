import {
  INTRO_COVER_FADE_DURATION_S,
  INTRO_COVER_FADE_START_S,
  INTRO_HERO_DURATION_S,
  INTRO_HERO_START_S,
  INTRO_LOGO_LAND_S,
  INTRO_MENU_DURATION_S,
  INTRO_MENU_START_S,
  INTRO_NAV_DURATION_S,
  INTRO_NAV_START_S,
  INTRO_PIXELS_END_S,
  INTRO_READY_S,
  INTRO_REVEAL_VARS,
  INTRO_VAR_DECIMALS,
} from 'constants/intro';
import type { IntroPhase } from 'features/stage';
import { clamp } from 'lib/math';

export type IntroRevealVar = (typeof INTRO_REVEAL_VARS)[number];
export type IntroRevealVars = Record<IntroRevealVar, string>;

const ramp = (t: number, startS: number, durationS: number) =>
  clamp((t - startS) / durationS, 0, 1);

export function introPhaseAt(t: number): IntroPhase {
  if (t < INTRO_PIXELS_END_S) return 'pixels';
  if (t < INTRO_LOGO_LAND_S) return 'swarm';
  if (t < INTRO_READY_S) return 'reveal';
  return 'done';
}

export function introVarsAt(t: number): IntroRevealVars {
  const format = (value: number) => value.toFixed(INTRO_VAR_DECIMALS);
  return {
    '--sv-nav': format(ramp(t, INTRO_NAV_START_S, INTRO_NAV_DURATION_S)),
    '--sv-menu': format(ramp(t, INTRO_MENU_START_S, INTRO_MENU_DURATION_S)),
    // The DOM logo swaps in at once when the swarm has landed exactly on it.
    '--sv-logo': t >= INTRO_LOGO_LAND_S ? '1' : '0',
    '--sv-hero': format(ramp(t, INTRO_HERO_START_S, INTRO_HERO_DURATION_S)),
  };
}

// Opacity of the solid cover the intro draws over the stage.
export function coverAlphaAt(t: number): number {
  return 1 - ramp(t, INTRO_COVER_FADE_START_S, INTRO_COVER_FADE_DURATION_S);
}
