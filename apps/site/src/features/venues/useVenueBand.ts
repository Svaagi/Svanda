import { VENUES_PAGE } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { useReducedMotion, useTheme } from 'hooks';
import { bindFrameLoopVisibility, createFrameLoop } from 'lib/frameLoop';
import { type RefObject, useEffect } from 'react';

import { createVenueBandScene } from './venueBandScene';

type VenueBandOptions = {
  frameRef: RefObject<HTMLElement | null>;
  cell: number;
};

// The venue bands' one rAF loop. It runs only while the venues page is the current page, the
// frame is on screen and the tab is visible, and starts over (with the new token colours)
// when the theme or the grid cell changes.
export function useVenueBand({ frameRef, cell }: VenueBandOptions) {
  const { theme } = useTheme();
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const scene = createVenueBandScene({ frame, cell, isReducedMotion });
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(([entry]) => {
            if (entry) {
              scene.resize(entry.contentRect.width, entry.contentRect.height);
            }
          });
    resizeObserver?.observe(frame);
    const loop = createFrameLoop(scene.draw);

    let isIntersecting = true;
    let isOnPage = useStageStore.getState().page === VENUES_PAGE;
    const syncOnScreen = () => loop.setIsOnScreen(isIntersecting && isOnPage);
    syncOnScreen();
    const unsubscribePage = useStageStore.subscribe(({ page }) => {
      if ((page === VENUES_PAGE) === isOnPage) return;
      isOnPage = !isOnPage;
      syncOnScreen();
    });
    const unbindVisibility = bindFrameLoopVisibility(
      {
        setIsTabVisible: loop.setIsTabVisible,
        setIsOnScreen: (isVisible) => {
          isIntersecting = isVisible;
          syncOnScreen();
        },
      },
      frame,
    );

    return () => {
      unbindVisibility();
      unsubscribePage();
      resizeObserver?.disconnect();
      loop.stop();
    };
    // `theme` is not read inside: a change re-reads the token colours in the new scene.
  }, [frameRef, cell, theme, isReducedMotion]);
}
