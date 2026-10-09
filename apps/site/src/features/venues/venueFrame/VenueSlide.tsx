import { type Venue, VENUE_PHOTO_SIZES } from 'constants/venues';
import { useLocale } from 'i18n';
import { type CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId, formatIsoDate } from 'utils';

import type { SwipeDrag } from '../useVenueSwipe';
import { VenuePhotoImage } from '../venuePhoto';
import styles from './venueFrame.module.css';

export type VenueSlideProps = {
  venue: Venue;
  isActive: boolean;
  photoIndex: number;
  drag: SwipeDrag;
  // The name as the band shows it (scrambling while the venue is being switched to).
  bandText: string;
  onSelectPhoto: (photoIndex: number) => void;
  onOpenPhoto: () => void;
  testId: string;
};

// One venue: its photo strip, the band with the venue name, the note and place over it, and a
// dot per photo. The whole photo is a button that opens it in the lightbox.
export const VenueSlide = memo(function VenueSlide({
  venue,
  isActive,
  photoIndex,
  drag,
  bandText,
  onSelectPhoto,
  onOpenPhoto,
  testId,
}: VenueSlideProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { id, name, city, date, color, tint, photos } = venue;
  const photoLabel = (index: number) =>
    t('venues.photo', { index: index + 1, count: photos.length, venue: name });
  const slideStyle = { '--venue-tint': tint } as CSSProperties;
  const openLabel = t('venues.lightbox.open', {
    index: photoIndex + 1,
    count: photos.length,
    venue: name,
  });
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
              sizes={VENUE_PHOTO_SIZES}
              loading="lazy"
              className={styles.image}
              photo={photo}
              alt={photoLabel(index)}
              testId={childTestId(testId, `photo-${index + 1}`)}
            />
          </div>
        ))}
      </div>
      <div className={styles.scrim} />
      <canvas
        className={styles.band}
        data-venue-band=""
        data-text={bandText}
        data-color={color}
        aria-hidden="true"
        data-testid={childTestId(testId, 'band')}
      />
      <button
        type="button"
        className={styles.open}
        aria-label={openLabel}
        onClick={onOpenPhoto}
        data-testid={childTestId(testId, 'open')}
      />
      <p className={styles.label}>
        <span className={styles.note}>{t(`venues.notes.${id}`)}</span>
        <span
          className={styles.place}
          data-testid={childTestId(testId, 'place')}
        >
          {t('venues.place', { city, date: formatIsoDate(date, locale) })}
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
