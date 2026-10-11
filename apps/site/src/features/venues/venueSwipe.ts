import {
  VENUE_SWIPE_COMMIT_MAX_PX,
  VENUE_SWIPE_COMMIT_RATIO,
  VENUE_SWIPE_RUBBER_BAND_RATIO,
} from 'constants/venues';

// The strip offset for a drag of `dragPx`: past the first or last photo it only pulls at a
// fraction, so the edge reads as an end.
export function rubberBand(
  dragPx: number,
  photoIndex: number,
  photoCount: number,
): number {
  const isPastStart = photoIndex === 0 && dragPx > 0;
  const isPastEnd = photoIndex >= photoCount - 1 && dragPx < 0;
  return isPastStart || isPastEnd
    ? dragPx * VENUE_SWIPE_RUBBER_BAND_RATIO
    : dragPx;
}

// Photos to step after a drag of `dragPx` on a `widthPx` wide frame: one towards the drag
// direction once it passes the commit distance, otherwise none.
export function swipeStep(dragPx: number, widthPx: number): -1 | 0 | 1 {
  const commitPx = Math.min(
    VENUE_SWIPE_COMMIT_MAX_PX,
    widthPx * VENUE_SWIPE_COMMIT_RATIO,
  );
  if (Math.abs(dragPx) <= commitPx) return 0;
  return dragPx < 0 ? 1 : -1;
}
