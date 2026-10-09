import { VENUES_PAGE } from 'constants/stage';
import { useStageStore } from 'features/stage';
import { useReducedMotion, useTheme } from 'hooks';
import { bindFrameLoopVisibility, createFrameLoop } from 'lib/frameLoop';
import { type RefObject, useEffect, useState } from 'react';

import { createVenueBandScene } from './venueBandScene';

type VenueBandOptions = {
  frameRef: RefObject<HTMLElement | null>;
  cell: number;
};

// The venue bands' one rAF loop. It runs only while the venues page is the current page, the
// frame is on screen and the tab is visible, and starts over (with the new token colours)
// when the theme or the grid cell changes. The scene is first set up when the venues layer
// comes into view, not on page load: its colour and size reads force a style and layout pass
// that would only add to the load's blocking time.
export function useVenueBand({ frameRef, cell }: VenueBandOptions) {
  const { theme } = useTheme();
  const isReducedMotion = useReducedMotion();
  const isNearVenues = useStageStore(
    (state) =>
      state.page === VENUES_PAGE || Math.abs(state.vp - VENUES_PAGE) < 1,
  );
  const [hasNearedVenues, setHasNearedVenues] = useState(isNearVenues);
  if (isNearVenues && !hasNearedVenues) setHasNearedVenues(true);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !hasNearedVenues) return undefined;
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
  }, [frameRef, cell, theme, isReducedMotion, hasNearedVenues]);
}
