import { useDrag } from '@use-gesture/react';
import { DISPLAY_SPLIT_DEFAULT_PERCENT } from 'constants/jukeboxUi';
import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useState,
} from 'react';

import { splitAfterKey, splitFromOffset } from './splitPosition';

// The bound handlers receive React's synthetic event, which has no `offsetX`.
function readOffsetX(event: unknown): number | null {
  const native =
    typeof event === 'object' && event !== null && 'nativeEvent' in event
      ? event.nativeEvent
      : event;
  return native instanceof MouseEvent ? native.offsetX : null;
}

// The split position, driven by horizontal drags on `surfaceRef` and by keys on the handle.
// Taps and vertical swipes (page scrolling on touch) leave it alone. The surface sits inside
// the warped projected display, so the pointer is read as `offsetX`: browsers map it back
// through the CSS transform into the surface's own box, where client coordinates would be
// skewed.
export function useSplitCompare(surfaceRef: RefObject<HTMLElement | null>) {
  const [splitPercent, setSplitPercent] = useState(
    DISPLAY_SPLIT_DEFAULT_PERCENT,
  );

  const bindDrag = useDrag(
    ({ event, tap }) => {
      const surface = surfaceRef.current;
      const offsetX = readOffsetX(event);
      if (tap || !surface || offsetX === null) return;
      const percent = splitFromOffset(offsetX, surface.offsetWidth);
      if (percent !== null) setSplitPercent(percent);
    },
    { axis: 'x', filterTaps: true },
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const percent = splitAfterKey(splitPercent, event);
      if (percent === null) return;
      // Keeps Home and End from also paging the stage.
      event.preventDefault();
      setSplitPercent(percent);
    },
    [splitPercent],
  );

  return { splitPercent, bindDrag, handleKeyDown };
}
