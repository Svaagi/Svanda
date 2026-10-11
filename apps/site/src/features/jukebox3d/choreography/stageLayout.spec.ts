import { describe, expect, it } from 'vitest';

import { worldUnitsPerPx } from '../sceneLayout';
import { createStageLayout, type StageLayout } from './stageLayout';

const NO_ANCHORS = { heroTextTop: null, karaoke: null, jukebox: null };

// Reference values from the prototype's `layout3D` + `fitCustom` (svanda-stage.js) for the
// same model bounds, page by page: hero, karaoke, jukebox, custom, venues.
const PROTOTYPE: Record<string, StageLayout> = {
  '1440x900': {
    x: [0, 350, -350, 0, 0],
    y: [-31.1111, -145.1719, -145.1719, -52.5708, -1100],
    scale: [1.3, 2.0341, 2.0341, 1.43, 1.3],
  },
  '1024x768': {
    x: [0, 350, -350, 0, 0],
    y: [-43.75, -178.8219, -178.8219, -78.6385, -1100],
    scale: [1.3, 2.4088, 2.4088, 1.43, 1.3],
  },
  '390x844': {
    x: [0, 0, 0, 0, 0],
    y: [-49.2308, 20, 20, -40.7118, -1400],
    scale: [1.35, 1.3, 1.3, 1.43, 0.8],
  },
};

const expectLayout = (actual: StageLayout, expected: StageLayout) => {
  for (const key of ['x', 'y', 'scale'] as const) {
    expected[key].forEach((value, page) => {
      expect(actual[key][page]).toBeCloseTo(value, 3);
    });
  }
};

describe('createStageLayout', () => {
  it.each([
    [1440, 900],
    [1024, 768],
    [390, 844],
  ])('matches the prototype at %ix%i', (width, height) => {
    const expected = PROTOTYPE[`${width}x${height}`];
    if (!expected) throw new Error('missing reference');

    expectLayout(createStageLayout({ width, height }, NO_ANCHORS), expected);
  });

  it('puts the products in opposite halves of a landscape stage', () => {
    const { x } = createStageLayout({ width: 1440, height: 900 }, NO_ANCHORS);

    expect(x[1]).toBeGreaterThan(0);
    expect(x[2]).toBe(-(x[1] ?? 0));
    expect(x[0]).toBe(0);
    expect(x[3]).toBe(0);
  });

  it('fits the whole model on Custom with room above the display in landscape and portrait', () => {
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 1280, height: 600 },
    ]) {
      const { y, scale } = createStageLayout(size, NO_ANCHORS);
      const unitsPerPx = worldUnitsPerPx(size);
      const half = (size.height * unitsPerPx) / 2;
      const customScale = scale[3] ?? 0;
      const customY = y[3] ?? 0;
      const displayTop = customY + 226.3 * customScale * 1.06;
      const modelBottom = customY - 241.6 * customScale * 1.06;

      expect(customScale).toBeLessThanOrEqual(1.43);
      expect(modelBottom).toBeGreaterThanOrEqual(-half);
      expect(half - displayTop).toBeGreaterThanOrEqual(148 * unitsPerPx - 1e-6);
    }
  });

  it('centres the portrait hero model between the header and the measured hero text', () => {
    const size = { width: 390, height: 844 };

    const layout = createStageLayout(size, { ...NO_ANCHORS, heroTextTop: 700 });

    expect(layout.y[0]).toBeCloseTo(61.5385, 3);
  });

  it('centres a portrait product model between its measured heading and body', () => {
    const size = { width: 390, height: 844 };

    const layout = createStageLayout(size, {
      ...NO_ANCHORS,
      karaoke: { top: 200, bottom: 600 },
      // Too tight a gap: the default position stays.
      jukebox: { top: 150, bottom: 200 },
    });

    expect(layout.y[1]).toBeCloseTo(33.8462, 3);
    expect(layout.y[2]).toBe(20);
  });

  it('ignores measurements in landscape and a hero text too high to fit under', () => {
    const anchors = {
      heroTextTop: 100,
      karaoke: { top: 200, bottom: 600 },
      jukebox: null,
    };

    expectLayout(
      createStageLayout({ width: 1440, height: 900 }, anchors),
      PROTOTYPE['1440x900'] as StageLayout,
    );
    expect(
      createStageLayout({ width: 390, height: 844 }, anchors).y[0],
    ).toBeCloseTo(-49.2308, 3);
  });
});
