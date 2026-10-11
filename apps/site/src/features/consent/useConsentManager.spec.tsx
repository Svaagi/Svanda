import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { syncConsentManager } from './consentManager';
import { useConsentManager } from './useConsentManager';

vi.mock('./consentManager', () => ({ syncConsentManager: vi.fn() }));

function renderAt(pathname: string) {
  return renderHook(() => useConsentManager(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    ),
  });
}

describe('useConsentManager', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('runs the consent manager in the URL locale', () => {
    renderAt('/en');

    expect(syncConsentManager).toHaveBeenCalledWith('en');
  });

  it('uses the default locale at the root', () => {
    renderAt('/');

    expect(syncConsentManager).toHaveBeenCalledWith('cs');
  });
});
