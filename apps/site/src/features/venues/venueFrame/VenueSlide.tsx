import type { Venue } from 'constants/venues';
import { useLocale } from 'i18n';
import { type CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

import type { SwipeDrag } from '../useVenueSwipe';
import { formatVenueDate } from '../venueDate';
import styles from './venueFrame.module.css';
import { VenuePhotoImage } from './VenuePhotoImage';

export type VenueSlideProps = {
  venue: Venue;
  isActive: boolean;
  photoIndex: number;
  drag: SwipeDrag;
  onSelectPhoto: (photoIndex: number) => void;
  testId: string;
};

// One venue: its photo strip, the note and place over it, and a dot per photo.
export const VenueSlide = memo(function VenueSlide({
  venue,
  isActive,
  photoIndex,
  drag,
  onSelectPhoto,
  testId,
}: VenueSlideProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { id, name, city, date, tint, photos } = venue;
  const photoLabel = (index: number) =>
    t('venues.photo', { index: index + 1, count: photos.length, venue: name });
  const slideStyle = { '--venue-tint': tint } as CSSProperties;
  const stripStyle = {
    '--venue-photo-index': photoIndex,
    '--venue-drag-x': `${drag.offsetPx}px`,
  } as CSSProperties;

  return (
    <div
      className={styles.slide}
      style={slideStyle}
      inert={!isActive}
      data-active={isActive}
      data-testid={testId}
    >
      <div
        className={styles.strip}
        style={stripStyle}
        data-dragging={drag.isDragging}
        data-photo-index={photoIndex}
        data-testid={childTestId(testId, 'strip')}
      >
        {photos.map((photo, index) => (
          <div key={photo.img.src} className={styles.photo}>
            <VenuePhotoImage
              photo={photo}
              alt={photoLabel(index)}
              testId={childTestId(testId, `photo-${index + 1}`)}
            />
          </div>
        ))}
      </div>
      <div className={styles.scrim} />
      <p className={styles.label}>
        <span className={styles.note}>{t(`venues.notes.${id}`)}</span>
        <span
          className={styles.place}
          data-testid={childTestId(testId, 'place')}
        >
          {t('venues.place', { city, date: formatVenueDate(date, locale) })}
        </span>
      </p>
      <div className={styles.dots}>
        {photos.map((photo, index) => (
          <button
            key={photo.img.src}
            type="button"
            className={styles.dot}
            aria-label={photoLabel(index)}
            aria-current={index === photoIndex}
            onClick={() => onSelectPhoto(index)}
            data-testid={childTestId(testId, `dot-${index + 1}`)}
          />
        ))}
      </div>
    </div>
  );
});
