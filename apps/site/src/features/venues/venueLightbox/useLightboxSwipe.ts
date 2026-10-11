import { useDrag } from '@use-gesture/react';
import { VENUE_SWIPE_START_PX } from 'constants/venues';
import type { RefObject } from 'react';

import { swipeStep } from '../venueSwipe';

// A horizontal swipe across the lightbox photo turns it on release, with the frame's commit
// distance.
export function useLightboxSwipe(
  photoRef: RefObject<HTMLElement | null>,
  onStep: (step: number) => void,
) {
  return useDrag(
    ({ last, tap, movement: [dragPx] }) => {
      if (!last || tap) return;
      const step = swipeStep(dragPx, photoRef.current?.offsetWidth ?? 0);
      if (step !== 0) onStep(step);
    },
    { axis: 'x', threshold: VENUE_SWIPE_START_PX, filterTaps: true },
  );
}
