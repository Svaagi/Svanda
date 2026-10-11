import { TOUCH_RELEASE_MS } from 'constants/stage';
import { type RefObject, useEffect } from 'react';

import { toStagePointer } from './stagePointer';
import { useStageStore } from './stageStore';

// Publishes the mouse or finger position over the stage. Touch has its own listeners: a
// finger that pans the page cancels its pointer events, but touchmove keeps firing.
export function useStagePointer(viewportRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    const track = (clientX: number, clientY: number) => {
      const { pointer, setPointer } = useStageStore.getState();
      setPointer(
        toStagePointer(
          clientX,
          clientY,
          element.getBoundingClientRect(),
          pointer,
        ),
      );
    };
    const release = () => {
      const { pointer, setPointer } = useStageStore.getState();
      if (pointer.isActive) setPointer({ ...pointer, isActive: false });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') track(event.clientX, event.clientY);
    };
    const handleTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      clearTimeout(releaseTimer);
      track(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => {
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(release, TOUCH_RELEASE_MS);
    };

    const root = document.documentElement;
    const passive = { passive: true };
    window.addEventListener('pointermove', handlePointerMove, passive);
    root.addEventListener('pointerleave', release);
    window.addEventListener('touchstart', handleTouch, passive);
    window.addEventListener('touchmove', handleTouch, passive);
    window.addEventListener('touchend', handleTouchEnd, passive);
    window.addEventListener('touchcancel', handleTouchEnd, passive);
    return () => {
      clearTimeout(releaseTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', release);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [viewportRef]);
}
