import { describe, expect, it } from 'vitest';

import { stagePointerToPx, toStagePointer } from './stagePointer';

const RECT = { left: 100, top: 50, width: 800, height: 600 };
const IDLE = { x: 0.25, y: 0.5, isActive: false };

describe('toStagePointer', () => {
  it('normalises to -1..1 with y up', () => {
    expect(toStagePointer(100, 50, RECT, IDLE)).toEqual({
      x: -1,
      y: 1,
      isActive: true,
    });
    expect(toStagePointer(500, 350, RECT, IDLE)).toEqual({
      x: 0,
      y: 0,
      isActive: true,
    });
    expect(toStagePointer(900, 650, RECT, IDLE)).toEqual({
      x: 1,
      y: -1,
      isActive: true,
    });
  });

  it('keeps the last position but goes inactive outside the stage', () => {
    const inside = { x: 0.1, y: 0.2, isActive: true };

    expect(toStagePointer(950, 300, RECT, inside)).toEqual({
      ...inside,
      isActive: false,
    });
  });

  it('is inactive on an unmeasured stage', () => {
    expect(
      toStagePointer(0, 0, { left: 0, top: 0, width: 0, height: 0 }, IDLE),
    ).toEqual(IDLE);
  });
});

describe('stagePointerToPx', () => {
  it('maps the normalised pointer back to stage px', () => {
    expect(stagePointerToPx({ x: 0, y: 0, isActive: true }, 800, 600)).toEqual({
      x: 400,
      y: 300,
    });
    expect(stagePointerToPx({ x: -1, y: 1, isActive: true }, 800, 600)).toEqual(
      { x: 0, y: 0 },
    );
  });
});
