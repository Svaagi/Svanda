import { VENUE_PHOTO_SIZES } from 'constants/venues';
import { memo } from 'react';
import type { Picture } from 'vite-imagetools';

import styles from './venueFrame.module.css';

export type VenuePhotoImageProps = {
  photo: Picture;
  alt: string;
  testId: string;
};

// Lazy, with its intrinsic size, so it reserves its box and loads only near the viewport.
export const VenuePhotoImage = memo(function VenuePhotoImage({
  photo,
  alt,
  testId,
}: VenuePhotoImageProps) {
  const { sources, img } = photo;
  return (
    <picture>
      {Object.entries(sources).map(([format, srcSet]) => (
        <source
          key={format}
          type={`image/${format}`}
          srcSet={srcSet}
          sizes={VENUE_PHOTO_SIZES}
        />
      ))}
      <img
        className={styles.image}
        src={img.src}
        width={img.w}
        height={img.h}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        data-testid={testId}
      />
    </picture>
  );
});
