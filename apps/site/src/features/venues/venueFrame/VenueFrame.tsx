import { type Venue, VENUE_CELL_FALLBACK_PX } from 'constants/venues';
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

import type { FrameSnap } from '../gridSnap';
import { useVenueBand } from '../useVenueBand';
import { useVenueScramble } from '../useVenueScramble';
import { IDLE_DRAG, useVenueSwipe } from '../useVenueSwipe';
import { frameKeyAction } from '../venueKeys';
import { VenueChevronButton } from './VenueChevronButton';
import styles from './venueFrame.module.css';
import { VenueSlide } from './VenueSlide';

export type VenueFrameProps = {
  id: string;
  // The active venue tab, which names this panel.
  labelledBy: string;
  venues: readonly Venue[];
  venueIndex: number;
  photoIndex: number;
  onStepVenue: (step: number) => void;
  onStepPhoto: (step: number) => void;
  onSelectPhoto: (photoIndex: number) => void;
  onOpenPhoto: () => void;
  snap: FrameSnap | null;
  testId?: string;
};

const snapStyle = (snap: FrameSnap | null) =>
  (snap
    ? {
        '--venue-cell': `${snap.cell}px`,
        '--venue-frame-w': `${snap.width}px`,
        '--venue-frame-h': `${snap.height}px`,
        '--venue-shift-x': `${snap.shiftX}px`,
        '--venue-shift-y': `${snap.shiftY}px`,
        '--venue-chevron-left': `${snap.chevronLeft}px`,
      }
    : {}) as CSSProperties;

// The venue photo frame: a vertical track of venues, each a horizontal strip of photos under
// a band with the venue name. Chevrons and up/down keys change the venue (its name scrambles
// in); dots, swipes and left/right keys the photo; a tap or Enter on the photo opens it.
export function VenueFrame({
  id,
  labelledBy,
  venues,
  venueIndex,
  photoIndex,
  onStepVenue,
  onStepPhoto,
  onSelectPhoto,
  onOpenPhoto,
  snap,
  testId = 'venue-frame',
}: VenueFrameProps) {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const cellPx = snap?.cell ?? VENUE_CELL_FALLBACK_PX;
  const activeName = venues[venueIndex]?.name ?? '';
  const bandText = useVenueScramble(activeName);
  useVenueBand({ frameRef, cell: cellPx });
  const { bindSwipe, drag, isDragClick } = useVenueSwipe({
    frameRef,
    photoIndex,
    photoCount: venues[venueIndex]?.photos.length ?? 0,
    onStep: onStepPhoto,
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const action = frameKeyAction(event.key);
      if (!action) return;
      // Keeps the arrows from also paging the stage.
      event.preventDefault();
      if (action.target === 'photo') onStepPhoto(action.step);
      else onStepVenue(action.step);
    },
    [onStepPhoto, onStepVenue],
  );
  const handlePrevious = useCallback(() => onStepVenue(-1), [onStepVenue]);
  const handleNext = useCallback(() => onStepVenue(1), [onStepVenue]);
  const handleOpenPhoto = useCallback(() => {
    if (!isDragClick()) onOpenPhoto();
  }, [isDragClick, onOpenPhoto]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the focusable tabpanel takes the arrow keys for its photos and venues (ARIA carousel pattern)
    <div
      {...bindSwipe()}
      ref={frameRef}
      id={id}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={labelledBy}
      className={styles.frame}
      style={snapStyle(snap)}
      onKeyDown={handleKeyDown}
      data-snapped={snap !== null}
      data-dragging={drag.isDragging}
      data-testid={testId}
    >
      <div
        className={styles.track}
        style={{ '--venue-index': venueIndex } as CSSProperties}
        data-venue-index={venueIndex}
        data-testid={childTestId(testId, 'track')}
      >
        {venues.map((venue, index) => {
          const isActive = index === venueIndex;
          return (
            <VenueSlide
              key={venue.id}
              venue={venue}
              isActive={isActive}
              photoIndex={isActive ? photoIndex : 0}
              drag={isActive ? drag : IDLE_DRAG}
              bandText={isActive ? bandText : venue.name}
              onSelectPhoto={onSelectPhoto}
              onOpenPhoto={handleOpenPhoto}
              testId={childTestId(testId, `slide-${venue.id}`)}
            />
          );
        })}
      </div>
      <VenueChevronButton
        direction="up"
        label={t('venues.previous')}
        cellPx={cellPx}
        onClick={handlePrevious}
        testId={childTestId(testId, 'previous')}
      />
      <VenueChevronButton
        direction="down"
        label={t('venues.next')}
        cellPx={cellPx}
        onClick={handleNext}
        testId={childTestId(testId, 'next')}
      />
    </div>
  );
}
