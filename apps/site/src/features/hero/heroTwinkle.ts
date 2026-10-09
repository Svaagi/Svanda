import {
  TWINKLE_ATTACK_S,
  TWINKLE_CELL_SHARE,
  TWINKLE_DECAY_EXPONENT,
  TWINKLE_DECAY_S,
  TWINKLE_PERIOD_MIN_S,
  TWINKLE_PERIOD_SALT,
  TWINKLE_PERIOD_SPREAD_S,
  TWINKLE_PHASE_SALT,
  TWINKLE_SHARE_SALT,
} from 'constants/hero';
import { hash3 } from 'lib/random';

// Variant A: a third of the cells blink on their own 2.5 to 7.5 s period, with a quick
// attack and a quadratic decay. 0..1, the same for a cell at the same time on every visit.
export function twinkleAlpha(col: number, row: number, t: number): number {
  if (hash3(col, row, TWINKLE_SHARE_SALT) > TWINKLE_CELL_SHARE) return 0;
  const periodS =
    TWINKLE_PERIOD_MIN_S +
    hash3(col, row, TWINKLE_PERIOD_SALT) * TWINKLE_PERIOD_SPREAD_S;
  const offsetS = hash3(col, row, TWINKLE_PHASE_SALT) * periodS;
  const phaseS = (((t + offsetS) % periodS) + periodS) % periodS;
  if (phaseS < TWINKLE_ATTACK_S) return phaseS / TWINKLE_ATTACK_S;
  const decayS = phaseS - TWINKLE_ATTACK_S;
  if (decayS >= TWINKLE_DECAY_S) return 0;
  return (1 - decayS / TWINKLE_DECAY_S) ** TWINKLE_DECAY_EXPONENT;
}
