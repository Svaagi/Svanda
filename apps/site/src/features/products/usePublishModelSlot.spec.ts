import { renderHook } from '@testing-library/react';
import { useStageStore } from 'features/stage';
import { afterEach, describe, expect, it } from 'vitest';

import { usePublishModelSlot } from './usePublishModelSlot';

function createElementAt(top: number, bottom: number) {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => ({ top, bottom }) as DOMRect;
  return element;
}

function createRefs() {
  return {
    stage: { current: createElementAt(0, 900) },
    heading: { current: createElementAt(130, 190) },
    body: { current: createElementAt(700, 820) },
  };
}

describe('usePublishModelSlot', () => {
  afterEach(() => {
    useStageStore.setState({
      modelAnchors: { heroTextTop: null, karaoke: null, jukebox: null },
    });
  });

  it('publishes the band between heading and body in portrait, cleared on unmount', () => {
    const { unmount } = renderHook(() =>
      usePublishModelSlot('jukebox', true, createRefs()),
    );
    expect(useStageStore.getState().modelAnchors.jukebox).toEqual({
      top: 190,
      bottom: 700,
    });
    expect(useStageStore.getState().modelAnchors.karaoke).toBeNull();

    unmount();
    expect(useStageStore.getState().modelAnchors.jukebox).toBeNull();
  });

  it('publishes nothing in landscape', () => {
    renderHook(() => usePublishModelSlot('karaoke', false, createRefs()));

    expect(useStageStore.getState().modelAnchors.karaoke).toBeNull();
  });

  it('clears the slot when the layout turns landscape', () => {
    const refs = createRefs();
    const { rerender } = renderHook(
      ({ isPortrait }) => usePublishModelSlot('karaoke', isPortrait, refs),
      { initialProps: { isPortrait: true } },
    );
    expect(useStageStore.getState().modelAnchors.karaoke).not.toBeNull();

    rerender({ isPortrait: false });
    expect(useStageStore.getState().modelAnchors.karaoke).toBeNull();
  });

  it('re-measures when the window resizes', () => {
    let bodyTop = 700;
    const refs = createRefs();
    refs.body.current.getBoundingClientRect = () =>
      ({ top: bodyTop, bottom: 820 }) as DOMRect;
    renderHook(() => usePublishModelSlot('karaoke', true, refs));

    bodyTop = 640;
    window.dispatchEvent(new Event('resize'));

    expect(useStageStore.getState().modelAnchors.karaoke).toEqual({
      top: 190,
      bottom: 640,
    });
  });
});
