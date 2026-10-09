import type { VenueId } from 'constants/venues';
import { track } from 'lib/analytics';
import { useEffect, useRef } from 'react';

// A venue view each time the carousel shows another venue. The venue the section opens on is
// counted by the venues section view.
export function useVenueViewTracking(venueId: VenueId) {
  const trackedVenueIdRef = useRef(venueId);

  useEffect(() => {
    if (trackedVenueIdRef.current === venueId) return;
    trackedVenueIdRef.current = venueId;
    track('venue_view', { venue: venueId });
  }, [venueId]);
}
