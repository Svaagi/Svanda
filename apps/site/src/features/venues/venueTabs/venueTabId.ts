import type { VenueId } from 'constants/venues';

export function venueTabId(idPrefix: string, venueId: VenueId): string {
  return `${idPrefix}-${venueId}`;
}
