import { act, renderHook } from '@testing-library/react';
import { trackPageView } from 'lib/analytics';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { startAnalytics } from './startAnalytics';
import { useAnalytics } from './useAnalytics';

const stop = vi.hoisted(() => vi.fn());

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  trackPageView: vi.fn(),
}));
vi.mock('./startAnalytics', () => ({ startAnalytics: vi.fn(() => stop) }));

function renderAtRoutes() {
  let router: ReturnType<typeof createMemoryRouter> | undefined;
  const wrapper = ({ children }: { children: ReactNode }) => {
    router ??= createMemoryRouter([{ path: '*', element: children }], {
      initialEntries: ['/'],
    });
    return <RouterProvider router={router} />;
  };
  const rendered = renderHook(() => useAnalytics(), { wrapper });

  return { ...rendered, navigate: (to: string) => router?.navigate(to) };
}

describe('useAnalytics', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts tracking once with the build config and stops on unmount', () => {
    const { unmount } = renderAtRoutes();

    expect(startAnalytics).toHaveBeenCalledOnce();
    expect(startAnalytics).toHaveBeenCalledWith(null, false);

    unmount();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('counts a page view per route but not per section hash', async () => {
    const { navigate } = renderAtRoutes();
    expect(trackPageView).toHaveBeenCalledOnce();

    await act(() => navigate('/en'));
    await act(() => navigate('/en#venues'));
    await act(() => navigate('/sk'));

    expect(trackPageView).toHaveBeenCalledTimes(3);
  });
});
