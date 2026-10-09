import { useDrag } from '@use-gesture/react';
import { VENUE_SWIPE_START_PX } from 'constants/venues';
import { type RefObject, useState } from 'react';

import { rubberBand, swipeStep } from './venueSwipe';

type SwipeOptions = {
  frameRef: RefObject<HTMLElement | null>;
  photoIndex: number;
  photoCount: number;
  onStep: (step: number) => void;
};

// While a drag is on, the strip follows the finger without its slide transition.
export type SwipeDrag = {
  isDragging: boolean;
  offsetPx: number;
};

export const IDLE_DRAG: SwipeDrag = { isDragging: false, offsetPx: 0 };

// Horizontal drags on the frame pull the photo strip along and turn the photo on release.
// Vertical drags stay with the page (`touch-action: pan-y` on the frame) and taps are left for
// the controls under them.
export function useVenueSwipe({
  frameRef,
  photoIndex,
  photoCount,
  onStep,
}: SwipeOptions) {
  const [drag, setDrag] = useState<SwipeDrag>(IDLE_DRAG);

  const bindSwipe = useDrag(
    ({ active, movement: [dragPx], tap }) => {
      if (tap) return;
      if (active) {
        setDrag({
          isDragging: true,
          offsetPx: rubberBand(dragPx, photoIndex, photoCount),
        });
        return;
      }
      setDrag(IDLE_DRAG);
      const step = swipeStep(dragPx, frameRef.current?.offsetWidth ?? 0);
      if (step !== 0) onStep(step);
    },
    {
      axis: 'x',
      threshold: VENUE_SWIPE_START_PX,
      filterTaps: true,
      // Captured pointers would retarget the click of a dot or chevron to the frame.
      pointer: { capture: false },
    },
  );

  return { bindSwipe, drag };
}
