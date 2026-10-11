import {
  SCREEN_LOGO_COLOR_VARS,
  SCREEN_LOGO_STEPS_PER_S,
  VU_BAR_COLOR_VARS,
  VU_BAR_COUNT,
  VU_LEVEL_BASE,
} from 'constants/jukebox3d';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { drawChin, vuBarLight, vuLevel } from './chinTexture';
import {
  createDisplayFrame,
  displayLogoAlpha,
  drawDisplay,
  logoCellColorIndex,
  updateDisplayFrame,
} from './displayTexture';
import { readScreenPalette, type ScreenPalette } from './screenPalette';

const PALETTE: ScreenPalette = {
  background: 'bg',
  vuOff: 'off',
  logo: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'],
  vu: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'],
};
const COLOR_COUNT = PALETTE.logo.length;
// The wordmark "S" bitmap has this many filled modules.
const S_CELL_COUNT = 10;

type Fill = { color: string; alpha: number };

function createRecordingContext() {
  const fills: Fill[] = [];
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(() => {
      fills.push({ color: context.fillStyle, alpha: context.globalAlpha });
    }),
  };
  return { context: context as unknown as CanvasRenderingContext2D, fills };
}

describe('displayLogoAlpha', () => {
  it('fades the S out over the first part of the hero to karaoke turn', () => {
    expect(displayLogoAlpha(0)).toBe(1);
    expect(displayLogoAlpha(0.3)).toBeCloseTo(0.5);
    expect(displayLogoAlpha(0.6)).toBe(0);
    expect(displayLogoAlpha(2)).toBe(0);
  });
});

describe('logoCellColorIndex', () => {
  it('stays in the palette and holds a colour for one step', () => {
    const index = logoCellColorIndex(1, 2, 0, COLOR_COUNT);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(COLOR_COUNT);
    expect(logoCellColorIndex(1, 2, 0, COLOR_COUNT)).toBe(index);
  });

  it('re-rolls colours over time', () => {
    const indices = new Set(
      Array.from({ length: 40 }, (_, i) =>
        logoCellColorIndex(1, 2, i / SCREEN_LOGO_STEPS_PER_S, COLOR_COUNT),
      ),
    );
    expect(indices.size).toBeGreaterThan(1);
  });
});

function frameAt(vp: number, timeS: number) {
  const frame = createDisplayFrame();
  updateDisplayFrame(frame, vp, timeS, COLOR_COUNT);
  return frame;
}

describe('updateDisplayFrame', () => {
  it('reports the first update as a change and colours every S cell', () => {
    const frame = createDisplayFrame();

    expect(updateDisplayFrame(frame, 0, 0, COLOR_COUNT)).toBe(true);
    expect(frame.logoAlpha).toBe(1);
    expect(frame.colorIndices).toHaveLength(S_CELL_COUNT);
    for (const index of frame.colorIndices) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(COLOR_COUNT);
    }
  });

  it('reports no change for the same vp and time, in place', () => {
    const frame = frameAt(0, 0);
    const { colorIndices } = frame;

    expect(updateDisplayFrame(frame, 0, 0, COLOR_COUNT)).toBe(false);
    expect(frame.colorIndices).toBe(colorIndices);
  });

  it('sees a fade step and a colour step', () => {
    const frame = frameAt(0, 0);
    expect(updateDisplayFrame(frame, 0.1, 0, COLOR_COUNT)).toBe(true);

    const hasColourChange = Array.from({ length: 40 }, (_, i) =>
      updateDisplayFrame(
        frame,
        0.1,
        (i + 1) / SCREEN_LOGO_STEPS_PER_S,
        COLOR_COUNT,
      ),
    ).some(Boolean);
    expect(hasColourChange).toBe(true);
  });

  it('stops tracking colours once the S has faded out', () => {
    const frame = frameAt(0.6, 0);

    expect(frame.logoAlpha).toBe(0);
    expect(updateDisplayFrame(frame, 1, 0, COLOR_COUNT)).toBe(false);
    expect(updateDisplayFrame(frame, 1, 9, COLOR_COUNT)).toBe(false);
  });
});

describe('drawDisplay', () => {
  it('draws the dark panel and the S in logo colours on the hero', () => {
    const { context, fills } = createRecordingContext();

    drawDisplay(context, frameAt(0.3, 0), PALETTE);

    expect(fills[0]).toEqual({ color: 'bg', alpha: 1 });
    expect(fills).toHaveLength(1 + S_CELL_COUNT);
    for (const fill of fills.slice(1)) {
      expect(PALETTE.logo).toContain(fill.color);
      expect(fill.alpha).toBeCloseTo(0.5);
    }
    expect(context.globalAlpha).toBe(1);
  });

  it('draws only the dark panel past the hero', () => {
    const { context, fills } = createRecordingContext();

    drawDisplay(context, frameAt(1, 0), PALETTE);

    expect(fills).toEqual([{ color: 'bg', alpha: 1 }]);
  });
});

describe('vuLevel', () => {
  it('wanders around its base inside the meter', () => {
    expect(vuLevel(0)).toBe(VU_LEVEL_BASE);
    for (let timeS = 0; timeS < 20; timeS += 0.37) {
      expect(vuLevel(timeS)).toBeGreaterThan(0);
      expect(vuLevel(timeS)).toBeLessThan(VU_BAR_COUNT);
    }
  });
});

describe('vuBarLight', () => {
  it('lights bars fully below the level and the next one partly', () => {
    expect(vuBarLight(3.25, 0)).toBe(1);
    expect(vuBarLight(3.25, 3)).toBeCloseTo(0.25);
    expect(vuBarLight(3.25, 4)).toBe(0);
  });
});

describe('drawChin', () => {
  it('draws every bar dark and paints the lit ones over it', () => {
    const { context, fills } = createRecordingContext();

    drawChin(context, 2.5, PALETTE);

    expect(fills[0]).toEqual({ color: 'bg', alpha: 1 });
    expect(fills.filter(({ color }) => color === 'off')).toHaveLength(
      VU_BAR_COUNT,
    );
    expect(fills.filter(({ color }) => color.startsWith('v'))).toEqual([
      { color: 'v1', alpha: 1 },
      { color: 'v2', alpha: 1 },
      { color: 'v3', alpha: 0.5 },
    ]);
    expect(context.globalAlpha).toBe(1);
  });
});

describe('readScreenPalette', () => {
  afterEach(() => document.documentElement.removeAttribute('style'));

  it('resolves the screen tokens', () => {
    const root = document.documentElement;
    root.style.setProperty('--color-jukebox-screen', 'screen');
    root.style.setProperty(SCREEN_LOGO_COLOR_VARS[0], 'logo-1');
    root.style.setProperty(VU_BAR_COLOR_VARS[6], 'vu-7');

    const palette = readScreenPalette(root);

    expect(palette.background).toBe('screen');
    expect(palette.logo).toHaveLength(SCREEN_LOGO_COLOR_VARS.length);
    expect(palette.logo[0]).toBe('logo-1');
    expect(palette.vu[6]).toBe('vu-7');
  });
});
