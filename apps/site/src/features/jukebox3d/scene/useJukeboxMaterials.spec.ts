import { renderHook } from '@testing-library/react';
import { Color, MeshPhysicalMaterial } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useJukeboxMaterials } from './useJukeboxMaterials';

describe('useJukeboxMaterials', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the same materials across renders and disposes them on unmount', () => {
    const dispose = vi.spyOn(MeshPhysicalMaterial.prototype, 'dispose');
    const shell = new Color();
    const glass = new Color();
    const { result, rerender, unmount } = renderHook(() =>
      useJukeboxMaterials(shell, glass),
    );
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);
    expect(dispose).not.toHaveBeenCalled();

    unmount();
    expect(dispose).toHaveBeenCalledTimes(2);
  });
});
