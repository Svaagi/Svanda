import type { Venue } from 'constants/venues';
import {
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
  useRef,
} from 'react';
import { childTestId } from 'utils';

import { tabKeyIndex } from '../venueKeys';
import { venueTabId } from './venueTabId';
import styles from './venueTabs.module.css';

export type VenueTabsProps = {
  ref?: Ref<HTMLDivElement>;
  venues: readonly Venue[];
  activeIndex: number;
  onSelect: (index: number) => void;
  // Tab element ids are `<idPrefix>-<venue id>`.
  idPrefix: string;
  panelId: string;
  labelledBy: string;
  testId?: string;
};

// A tablist with roving focus: arrows, Home and End move focus and select the venue at once.
export function VenueTabs({
  ref,
  venues,
  activeIndex,
  onSelect,
  idPrefix,
  panelId,
  labelledBy,
  testId = 'venue-tabs',
}: VenueTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const nextIndex = tabKeyIndex(event.key, activeIndex, venues.length);
    if (nextIndex === null) return;
    // Keeps the keys from also paging the stage.
    event.preventDefault();
    onSelect(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-labelledby={labelledBy}
      className={styles.tabs}
      data-testid={testId}
    >
      {venues.map((venue, index) => {
        const isSelected = index === activeIndex;
        return (
          <button
            key={venue.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={venueTabId(idPrefix, venue.id)}
            aria-selected={isSelected}
            aria-controls={panelId}
            tabIndex={isSelected ? 0 : -1}
            className={styles.tab}
            style={{ '--venue-color': venue.color } as CSSProperties}
            onClick={() => onSelect(index)}
            onKeyDown={handleKeyDown}
            data-testid={childTestId(testId, venue.id)}
          >
            <span className={styles.bar} />
            <span className={styles.label}>
              <span className={styles.number}>{index + 1}</span>
              <span className={styles.name}>{venue.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
