import { act, renderHook } from '@testing-library/react';
import { CONFIGURATOR_CHANGE_DEBOUNCE_MS } from 'constants/analytics';
import {
  CONFIGURATOR_STORAGE_KEY,
  CONFIGURATOR_STORAGE_VERSION,
} from 'constants/configurator';
import { track } from 'lib/analytics';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createInitialConfiguratorValues,
  useConfiguratorStore,
} from './configuratorStore';
import { useConfiguratorChangeTracking } from './useConfiguratorChangeTracking';

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  track: vi.fn(),
}));

const { getState } = useConfiguratorStore;
const STORED_BASE = '#123456';

describe('useConfiguratorChangeTracking', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    window.localStorage.clear();
    useConfiguratorStore.setState(createInitialConfiguratorValues());
    await useConfiguratorStore.persist.rehydrate();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(track).mockClear();
  });

  it('reports a burst of edits once, naming the design and section', () => {
    renderHook(() => useConfiguratorChangeTracking());

    act(() => {
      getState().setValue('base', '#111111');
      vi.advanceTimersByTime(CONFIGURATOR_CHANGE_DEBOUNCE_MS - 1);
      getState().setValue('base', '#222222');
    });
    vi.advanceTimersByTime(CONFIGURATOR_CHANGE_DEBOUNCE_MS - 1);
    expect(track).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(track).toHaveBeenCalledExactlyOnceWith('configurator_change', {
      design: 'pixel',
      section: 'sing',
    });
  });

  it('ignores switches that change no setting and an invalid value', () => {
    renderHook(() => useConfiguratorChangeTracking());

    act(() => {
      getState().setDesign('glass');
      getState().setValue('base', 'not a colour');
    });
    vi.advanceTimersByTime(CONFIGURATOR_CHANGE_DEBOUNCE_MS);

    expect(track).not.toHaveBeenCalled();
  });

  it('does not count restoring the stored configuration as an edit', async () => {
    renderHook(() => useConfiguratorChangeTracking());
    const stored = createInitialConfiguratorValues();
    window.localStorage.setItem(
      CONFIGURATOR_STORAGE_KEY,
      JSON.stringify({
        state: {
          ...stored,
          config: {
            ...stored.config,
            pixel: {
              ...stored.config.pixel,
              sing: { ...stored.config.pixel.sing, base: STORED_BASE },
            },
          },
        },
        version: CONFIGURATOR_STORAGE_VERSION,
      }),
    );

    await act(() => useConfiguratorStore.persist.rehydrate());
    vi.advanceTimersByTime(CONFIGURATOR_CHANGE_DEBOUNCE_MS);

    expect(getState().config.pixel.sing.base).toBe(STORED_BASE);
    expect(track).not.toHaveBeenCalled();
  });

  it('sends a pending report when the section unmounts', () => {
    const { unmount } = renderHook(() => useConfiguratorChangeTracking());
    act(() => {
      getState().resetCurrent();
      getState().setValue('base', '#333333');
    });

    unmount();

    expect(track).toHaveBeenCalledOnce();
  });
});
