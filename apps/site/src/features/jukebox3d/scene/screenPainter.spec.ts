import { CanvasTexture } from 'three';
import { describe, expect, it, vi } from 'vitest';

import type { ScreenPalette } from '../screenTextures';
import { createScreenPainter } from './screenPainter';
import type { CanvasSurface } from './useCanvasTexture';

const PALETTE: ScreenPalette = {
  background: 'bg',
  vuOff: 'off',
  logo: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'],
  vu: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'],
};

function createSurface(hasContext = true) {
  const fillRect = vi.fn();
  const context = hasContext
    ? ({
        fillStyle: '',
        globalAlpha: 1,
        fillRect,
      } as unknown as CanvasRenderingContext2D)
    : null;
  const texture = new CanvasTexture(document.createElement('canvas'));
  const surface: CanvasSurface = { context, texture };
  // A canvas texture starts flagged for upload; count the uploads asked for since.
  const initialVersion = texture.version;
  const uploads = () => texture.version - initialVersion;
  return { surface, fillRect, uploads };
}

describe('createScreenPainter', () => {
  it('draws both screens and flags their textures on the first frame', () => {
    const display = createSurface();
    const chin = createSurface();
    const paint = createScreenPainter({
      display: display.surface,
      chin: chin.surface,
      palette: PALETTE,
    });

    paint(0, 0);

    expect(display.fillRect).toHaveBeenCalled();
    expect(chin.fillRect).toHaveBeenCalled();
    expect(display.uploads()).toBe(1);
    expect(chin.uploads()).toBe(1);
  });

  it('skips a redraw while nothing on a screen changed', () => {
    const display = createSurface();
    const chin = createSurface();
    const paint = createScreenPainter({
      display: display.surface,
      chin: chin.surface,
      palette: PALETTE,
    });

    paint(1, 0);
    paint(1, 0);
    expect(display.uploads()).toBe(1);
    expect(chin.uploads()).toBe(1);

    // Past the hero the display stays dark while the VU meter keeps moving.
    paint(1.2, 0.5);
    expect(display.uploads()).toBe(1);
    expect(chin.uploads()).toBe(2);
  });

  it('leaves a screen without a 2D context alone', () => {
    const display = createSurface(false);
    const chin = createSurface();
    const paint = createScreenPainter({
      display: display.surface,
      chin: chin.surface,
      palette: PALETTE,
    });

    paint(0, 0);

    expect(display.uploads()).toBe(0);
    expect(chin.uploads()).toBe(1);
  });
});
