import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useIsHydrated } from './useIsHydrated';

function HydrationProbe() {
  return <span>{String(useIsHydrated())}</span>;
}

describe('useIsHydrated', () => {
  it('is false in prerendered HTML', () => {
    expect(renderToString(<HydrationProbe />)).toContain('false');
  });

  it('is true once rendered on the client', () => {
    const { result } = renderHook(() => useIsHydrated());

    expect(result.current).toBe(true);
  });
});
