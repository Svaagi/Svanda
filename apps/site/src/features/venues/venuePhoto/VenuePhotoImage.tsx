import { memo } from 'react';
import type { Picture } from 'vite-imagetools';

export type VenuePhotoImageProps = {
  photo: Picture;
  alt: string;
  // The `sizes` hint for the responsive sources.
  sizes: string;
  loading: 'lazy' | 'eager';
  className?: string;
  testId: string;
};

// A venue photo as a responsive picture with its intrinsic size, so it reserves its box.
// Callers pick the sizes hint, loading and their own styling.
export const VenuePhotoImage = memo(function VenuePhotoImage({
  photo,
  alt,
  sizes,
  loading,
  className,
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
          sizes={sizes}
        />
      ))}
      <img
        className={className}
        src={img.src}
        width={img.w}
        height={img.h}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        data-testid={testId}
      />
    </picture>
  );
});
