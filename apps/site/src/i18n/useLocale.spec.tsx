import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useLocale } from './useLocale';

function renderUseLocale(path: string) {
  return renderHook(() => useLocale(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
    ),
  });
}

describe('useLocale', () => {
  it('returns the locale of the current URL', () => {
    expect(renderUseLocale('/sk').result.current).toBe('sk');
  });

  it('returns the default locale at the site root', () => {
    expect(renderUseLocale('/').result.current).toBe('cs');
  });
});
