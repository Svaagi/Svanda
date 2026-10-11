import { renderHook } from '@testing-library/react';
import { GLASS_UI_DEFAULTS, PIXEL_UI_DEFAULTS } from 'constants/jukeboxUi';
import { describe, expect, it } from 'vitest';

import { useDesignLamp } from './useDesignLamp';

describe('useDesignLamp', () => {
  it('builds the lamp settings of the design it sits behind', () => {
    const { result } = renderHook(() =>
      useDesignLamp({ design: 'glass', config: GLASS_UI_DEFAULTS.sing }, true),
    );

    expect(result.current.settings.design).toBe('glass');
    expect(result.current.settings.blur).toBe(GLASS_UI_DEFAULTS.sing.blur);
    expect(result.current.isHidden).toBe(true);
  });

  it('keeps the same slot until the config changes', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useDesignLamp({ design: 'pixel', config }),
      { initialProps: { config: PIXEL_UI_DEFAULTS.sing } },
    );
    const first = result.current;

    rerender({ config: PIXEL_UI_DEFAULTS.sing });
    expect(result.current).toBe(first);

    rerender({ config: PIXEL_UI_DEFAULTS.listen });
    expect(result.current).not.toBe(first);
    expect(result.current.canvasRef).toBe(first.canvasRef);
  });
});
