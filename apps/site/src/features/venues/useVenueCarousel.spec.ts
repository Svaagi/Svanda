import { act, renderHook } from '@testing-library/react';
import { VENUES } from 'constants/venues';
import { describe, expect, it } from 'vitest';

import { useVenueCarousel } from './useVenueCarousel';

const renderCarousel = () => renderHook(() => useVenueCarousel(VENUES));

describe('useVenueCarousel', () => {
  it('starts on the first photo of the first venue', () => {
    const { result } = renderCarousel();

    expect(result.current.venueIndex).toBe(0);
    expect(result.current.photoIndex).toBe(0);
  });

  it('steps through the photos and stops at both ends', () => {
    const { result } = renderCarousel();
    const lastPhoto = VENUES[0].photos.length - 1;

    act(() => result.current.stepPhoto(-1));
    expect(result.current.photoIndex).toBe(0);

    act(() => result.current.selectPhoto(lastPhoto));
    act(() => result.current.stepPhoto(1));
    expect(result.current.photoIndex).toBe(lastPhoto);

    act(() => result.current.stepPhoto(-1));
    expect(result.current.photoIndex).toBe(lastPhoto - 1);
  });

  it('wraps the venues and opens each on its first photo', () => {
    const { result } = renderCarousel();

    act(() => result.current.selectPhoto(2));
    act(() => result.current.stepVenue(-1));
    expect(result.current.venueIndex).toBe(VENUES.length - 1);
    expect(result.current.photoIndex).toBe(0);

    act(() => result.current.stepVenue(1));
    expect(result.current.venueIndex).toBe(0);
  });

  it('keeps the photo when the selected venue is chosen again', () => {
    const { result } = renderCarousel();

    act(() => result.current.selectVenue(3));
    act(() => result.current.selectPhoto(2));
    act(() => result.current.selectVenue(3));
    expect(result.current.photoIndex).toBe(2);

    act(() => result.current.selectVenue(1));
    expect(result.current.venueIndex).toBe(1);
    expect(result.current.photoIndex).toBe(0);
  });
});
