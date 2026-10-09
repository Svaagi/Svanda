import { act, renderHook } from '@testing-library/react';
import { HERO_PAGE, JUKEBOX_PAGE, KARAOKE_PAGE } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { usePageAccent } from './usePageAccent';

const root = document.documentElement;

describe('usePageAccent', () => {
  beforeEach(() => {
    root.setAttribute('data-cursor', 'on');
  });

  afterEach(() => {
    useStageStore.setState({ page: HERO_PAGE });
    root.removeAttribute('data-accent');
    root.removeAttribute('data-cursor');
  });

  it('follows the stage page through the store', () => {
    renderHook(() => usePageAccent());
    expect(root).not.toHaveAttribute('data-accent');

    act(() => useStageStore.getState().setPage(JUKEBOX_PAGE));
    expect(root).toHaveAttribute('data-accent', 'magenta');
    expect(root).toHaveAttribute('data-cursor', 'magenta');

    act(() => useStageStore.getState().setPage(KARAOKE_PAGE));
    expect(root).not.toHaveAttribute('data-accent');
    expect(root).toHaveAttribute('data-cursor', 'on');
  });

  it('restores the default set on unmount', () => {
    useStageStore.setState({ page: JUKEBOX_PAGE });
    const { unmount } = renderHook(() => usePageAccent());
    expect(root).toHaveAttribute('data-accent', 'magenta');

    unmount();
    expect(root).not.toHaveAttribute('data-accent');
    expect(root).toHaveAttribute('data-cursor', 'on');
  });
});
