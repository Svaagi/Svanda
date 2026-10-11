import {
  type Venue,
  VENUE_LIGHTBOX_CHEVRON_CELL_PX,
  VENUE_LIGHTBOX_PHOTO_SIZES,
} from 'constants/venues';
import { type KeyboardEvent, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, IconButton, PixelChevron } from 'ui';
import { childTestId } from 'utils';

import { frameKeyAction } from '../venueKeys';
import { VenuePhotoImage } from '../venuePhoto';
import { useLightboxSwipe } from './useLightboxSwipe';
import styles from './venueLightbox.module.css';

export type VenueLightboxProps = {
  venue: Venue;
  photoIndex: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStepPhoto: (step: number) => void;
  testId?: string;
};

// The active venue's photo at full size. The title is the counter, the image carries the same
// text as its alt; arrows, left and right keys and a swipe turn the photo, Escape and the close
// button close it and focus returns to what opened it.
export function VenueLightbox({
  venue,
  photoIndex,
  isOpen,
  onOpenChange,
  onStepPhoto,
  testId = 'venue-lightbox',
}: VenueLightboxProps) {
  const { t } = useTranslation();
  const photoRef = useRef<HTMLDivElement>(null);
  const bindSwipe = useLightboxSwipe(photoRef, onStepPhoto);
  const { name, photos } = venue;
  const photo = photos[photoIndex];
  const isFirst = photoIndex <= 0;
  const isLast = photoIndex >= photos.length - 1;
  const label = t('venues.photo', {
    index: photoIndex + 1,
    count: photos.length,
    venue: name,
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const action = frameKeyAction(event.key);
      if (action?.target !== 'photo') return;
      event.preventDefault();
      onStepPhoto(action.step);
    },
    [onStepPhoto],
  );
  const handlePrevious = useCallback(() => {
    if (!isFirst) onStepPhoto(-1);
  }, [isFirst, onStepPhoto]);
  const handleNext = useCallback(() => {
    if (!isLast) onStepPhoto(1);
  }, [isLast, onStepPhoto]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={label}
      closeLabel={t('venues.lightbox.close')}
      variant="fullscreen"
      onContentKeyDown={handleKeyDown}
      testId={testId}
    >
      <div className={styles.body}>
        <IconButton
          label={t('venues.lightbox.previous')}
          aria-disabled={isFirst}
          onClick={handlePrevious}
          testId={childTestId(testId, 'previous')}
        >
          <PixelChevron
            direction="left"
            cellSize={VENUE_LIGHTBOX_CHEVRON_CELL_PX}
          />
        </IconButton>
        <div
          {...bindSwipe()}
          ref={photoRef}
          className={styles.photo}
          data-photo-index={photoIndex}
          data-testid={childTestId(testId, 'photo')}
        >
          {photo && (
            <VenuePhotoImage
              photo={photo}
              alt={label}
              sizes={VENUE_LIGHTBOX_PHOTO_SIZES}
              loading="eager"
              className={styles.image}
              testId={childTestId(testId, 'image')}
            />
          )}
        </div>
        <IconButton
          label={t('venues.lightbox.next')}
          aria-disabled={isLast}
          onClick={handleNext}
          testId={childTestId(testId, 'next')}
        >
          <PixelChevron
            direction="right"
            cellSize={VENUE_LIGHTBOX_CHEVRON_CELL_PX}
          />
        </IconButton>
      </div>
    </Dialog>
  );
}
