import { renderHook } from '@testing-library/react';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCanvasTexture } from './useCanvasTexture';

describe('useCanvasTexture', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a sized sRGB canvas texture once and disposes it on unmount', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const dispose = vi.spyOn(CanvasTexture.prototype, 'dispose');
    const { result, rerender, unmount } = renderHook(() =>
      useCanvasTexture(380, 657),
    );
    const { texture } = result.current;
    const canvas = texture.image as HTMLCanvasElement;

    expect(canvas.width).toBe(380);
    expect(canvas.height).toBe(657);
    expect(texture.colorSpace).toBe(SRGBColorSpace);
    expect(texture.generateMipmaps).toBe(false);
    expect(texture.minFilter).toBe(LinearFilter);

    rerender();
    expect(result.current.texture).toBe(texture);
    expect(dispose).not.toHaveBeenCalled();

    unmount();
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
