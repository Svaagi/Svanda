import type { Venue } from 'constants/venues';
import { clamp } from 'lib/math';
import { useCallback, useState } from 'react';

import { wrapIndex } from './venueKeys';

type CarouselPosition = {
  venueIndex: number;
  photoIndex: number;
};

// Which venue and which of its photos the frame shows. Venues wrap around (the chevrons cycle);
// photos stop at the ends, as the swipe does. A newly chosen venue opens on its first photo.
export function useVenueCarousel(venues: readonly Venue[]) {
  const [{ venueIndex, photoIndex }, setPosition] = useState<CarouselPosition>({
    venueIndex: 0,
    photoIndex: 0,
  });

  const selectVenue = useCallback(
    (index: number) =>
      setPosition((current) =>
        current.venueIndex === index
          ? current
          : { venueIndex: index, photoIndex: 0 },
      ),
    [],
  );

  const stepVenue = useCallback(
    (step: number) =>
      setPosition((current) => ({
        venueIndex: wrapIndex(current.venueIndex + step, venues.length),
        photoIndex: 0,
      })),
    [venues.length],
  );

  const selectPhoto = useCallback(
    (index: number) =>
      setPosition((current) => ({ ...current, photoIndex: index })),
    [],
  );

  const stepPhoto = useCallback(
    (step: number) =>
      setPosition((current) => {
        const photoCount = venues[current.venueIndex]?.photos.length ?? 0;
        const nextPhoto = clamp(
          current.photoIndex + step,
          0,
          Math.max(0, photoCount - 1),
        );
        return nextPhoto === current.photoIndex
          ? current
          : { ...current, photoIndex: nextPhoto };
      }),
    [venues],
  );

  return {
    venueIndex,
    photoIndex,
    selectVenue,
    stepVenue,
    selectPhoto,
    stepPhoto,
  };
}
