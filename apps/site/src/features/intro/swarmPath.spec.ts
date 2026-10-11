import {
  INTRO_CELL_GAP_PX,
  INTRO_LOGO_LAND_S,
  INTRO_PIXELS_END_S,
  SWARM_TRAIL_ALPHA,
  SWARM_TRAIL_COUNT,
} from 'constants/intro';
import { LOGO_CELL_INSET_PX } from 'constants/pixel';
import { describe, expect, it } from 'vitest';

import { createIntroLayout, type IntroCell } from './introLayout';
import {
  quadraticBezier,
  swarmControlPoint,
  swarmEndPoint,
  swarmProgress,
  swarmSprites,
  type SwarmTarget,
} from './swarmPath';

const CELL_PX = 20;
const TARGET: SwarmTarget = { x: 115.5, y: 22, cellPx: 4 };

const logoCell = (overrides: Partial<IntroCell> = {}): IntroCell => ({
  col: 10,
  row: 12,
  logo: { col: 18, row: 3, letterIndex: 3 },
  lockS: 1.5,
  delaySeed: 0.5,
  arcSeedX: 0.5,
  arcSeedY: 0.5,
  ...overrides,
});

describe('quadraticBezier', () => {
  const from = { x: 0, y: 100 };
  const control = { x: 50, y: -100 };
  const to = { x: 100, y: 100 };

  it('starts and ends on its end points', () => {
    expect(quadraticBezier(from, control, to, 0)).toEqual(from);
    expect(quadraticBezier(from, control, to, 1)).toEqual(to);
  });

  it('bends toward the control point halfway', () => {
    expect(quadraticBezier(from, control, to, 0.5)).toEqual({ x: 50, y: 0 });
  });
});

describe('swarmControlPoint', () => {
  it('sits above both ends, centred for a neutral seed', () => {
    const point = swarmControlPoint(
      { x: 0, y: 400 },
      { x: 200, y: 20 },
      logoCell({ arcSeedX: 0.5, arcSeedY: 0 }),
    );

    expect(point).toEqual({ x: 100, y: 20 - 140 });
  });

  it('shifts sideways and lifts higher with the seeds', () => {
    const point = swarmControlPoint(
      { x: 0, y: 400 },
      { x: 200, y: 20 },
      logoCell({ arcSeedX: 1, arcSeedY: 1 }),
    );

    expect(point).toEqual({ x: 100 + 160, y: 20 - 140 - 260 });
  });
});

describe('swarmProgress', () => {
  it('waits for the pixels to resolve, then flies for 0.85s', () => {
    const cell = logoCell({
      logo: { col: 0, row: 0, letterIndex: 0 },
      delaySeed: 0,
    });

    expect(swarmProgress(cell, INTRO_PIXELS_END_S)).toBe(0);
    expect(swarmProgress(cell, INTRO_PIXELS_END_S + 0.425)).toBeCloseTo(0.5);
    expect(swarmProgress(cell, INTRO_PIXELS_END_S + 0.86)).toBe(1);
  });

  it('starts later for columns further right', () => {
    const left = logoCell({ logo: { col: 0, row: 0, letterIndex: 0 } });
    const right = logoCell({ logo: { col: 35, row: 0, letterIndex: 5 } });
    const t = INTRO_PIXELS_END_S + 0.5;

    expect(swarmProgress(right, t)).toBeLessThan(swarmProgress(left, t));
  });

  it('lands every cell of a real layout before the DOM logo takes over', () => {
    const layout = createIntroLayout(1440, 900);

    layout.logoCells.forEach((cell) => {
      expect(swarmProgress(cell, INTRO_LOGO_LAND_S)).toBe(1);
    });
  });
});

describe('swarmSprites', () => {
  it('waits at its intro cell before departure, without trails', () => {
    const cell = logoCell();

    expect(swarmSprites(cell, CELL_PX, TARGET, 0)).toEqual([
      { x: 200, y: 240, size: CELL_PX, alpha: 1, insetPx: INTRO_CELL_GAP_PX },
    ]);
  });

  it('draws three fading ghost trails while flying', () => {
    const cell = logoCell();
    const sprites = swarmSprites(cell, CELL_PX, TARGET, 4);

    expect(sprites).toHaveLength(SWARM_TRAIL_COUNT + 1);
    expect(sprites.map(({ alpha }) => alpha)).toEqual([
      SWARM_TRAIL_ALPHA,
      SWARM_TRAIL_ALPHA / 2,
      SWARM_TRAIL_ALPHA / 3,
      1,
    ]);
  });

  it('lands exactly on its nav logo module with the logo inset', () => {
    const cell = logoCell();
    const end = swarmEndPoint(cell, TARGET);

    expect(end).toEqual({ x: 115.5 + 18 * 4, y: 22 + 3 * 4 });
    expect(swarmSprites(cell, CELL_PX, TARGET, INTRO_LOGO_LAND_S)).toEqual([
      { ...end, size: TARGET.cellPx, alpha: 1, insetPx: LOGO_CELL_INSET_PX },
    ]);
  });
});
