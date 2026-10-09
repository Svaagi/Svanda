import { renderHook } from '@testing-library/react';
import { useStageStore } from 'features/stage';
import { afterEach, describe, expect, it } from 'vitest';

import { usePublishHeroTextTop } from './usePublishHeroTextTop';

function createText(offsetTop: number) {
  const element = document.createElement('div');
  Object.defineProperty(element, 'offsetTop', {
    configurable: true,
    get: () => offsetTop,
  });
  return element;
}

describe('usePublishHeroTextTop', () => {
  afterEach(() => {
    useStageStore.setState({
      modelAnchors: { heroTextTop: null, karaoke: null, jukebox: null },
    });
  });

  it('publishes the text top on mount and clears it on unmount', () => {
    const ref = { current: createText(640) };

    const { unmount } = renderHook(() => usePublishHeroTextTop(ref));
    expect(useStageStore.getState().modelAnchors.heroTextTop).toBe(640);

    unmount();
    expect(useStageStore.getState().modelAnchors.heroTextTop).toBeNull();
  });

  it('re-measures when the window resizes', () => {
    let offsetTop = 640;
    const element = document.createElement('div');
    Object.defineProperty(element, 'offsetTop', { get: () => offsetTop });
    renderHook(() => usePublishHeroTextTop({ current: element }));

    offsetTop = 520;
    window.dispatchEvent(new Event('resize'));

    expect(useStageStore.getState().modelAnchors.heroTextTop).toBe(520);
  });
});
