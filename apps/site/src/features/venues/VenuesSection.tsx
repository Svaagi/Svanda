import {
  VENUE_HEADING_CELL_RATIO,
  VENUE_HEADING_FALLBACK_CELL_PX,
  VENUE_HEADING_FALLBACK_MAX_COLS,
  VENUES,
} from 'constants/venues';
import {
  type CSSProperties,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { PixelText } from 'ui';
import { childTestId } from 'utils';

import type { HeadingSnap } from './gridSnap';
import { useVenueCarousel } from './useVenueCarousel';
import { useVenueGridSnap } from './useVenueGridSnap';
import { VenueFrame } from './venueFrame';
import { VenueLightbox } from './venueLightbox';
import styles from './venuesSection.module.css';
import { venueTabId, VenueTabs } from './venueTabs';

export type VenuesSectionProps = {
  testId?: string;
};

const headingShiftStyle = (heading: HeadingSnap | null) =>
  (heading
    ? {
        '--venue-heading-shift-x': `${heading.shiftX}px`,
        '--venue-heading-shift-y': `${heading.shiftY}px`,
      }
    : {}) as CSSProperties;

// The venues page: a pixel heading in the active venue's colour, the photo frame and the
// venue tabs, all snapped onto the background grid, and the photo lightbox.
export function VenuesSection({
  testId = 'venues-section',
}: VenuesSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const panelId = useId();
  const tabIdPrefix = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const frameHostRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const {
    venueIndex,
    photoIndex,
    selectVenue,
    stepVenue,
    selectPhoto,
    stepPhoto,
  } = useVenueCarousel(VENUES);
  const snap = useVenueGridSnap({
    section: sectionRef,
    heading: headingRef,
    frameHost: frameHostRef,
    tabs: tabsRef,
  });
  const activeVenue = VENUES[venueIndex] ?? VENUES[0];
  const headingColors = useMemo(() => [activeVenue.color], [activeVenue.color]);
  const handleOpenPhoto = useCallback(() => setIsLightboxOpen(true), []);

  return (
    <section
      ref={sectionRef}
      className={styles.venuesSection}
      aria-labelledby={headingId}
      data-testid={testId}
    >
      <h2
        ref={headingRef}
        id={headingId}
        className={styles.heading}
        data-testid={childTestId(testId, 'heading')}
      >
        <span
          className={styles.headingCells}
          style={headingShiftStyle(snap.heading)}
          data-snapped={snap.heading !== null}
        >
          <PixelText
            text={t('venues.tag')}
            cellSize={
              snap.frame
                ? snap.frame.cell * VENUE_HEADING_CELL_RATIO
                : VENUE_HEADING_FALLBACK_CELL_PX
            }
            maxCols={
              snap.heading
                ? snap.heading.cols / VENUE_HEADING_CELL_RATIO
                : VENUE_HEADING_FALLBACK_MAX_COLS
            }
            colors={headingColors}
            testId={childTestId(testId, 'heading-pixels')}
          />
        </span>
      </h2>
      <div ref={frameHostRef} className={styles.frameHost}>
        <VenueFrame
          id={panelId}
          labelledBy={venueTabId(tabIdPrefix, activeVenue.id)}
          venues={VENUES}
          venueIndex={venueIndex}
          photoIndex={photoIndex}
          onStepVenue={stepVenue}
          onStepPhoto={stepPhoto}
          onSelectPhoto={selectPhoto}
          onOpenPhoto={handleOpenPhoto}
          snap={snap.frame}
        />
        <VenueTabs
          ref={tabsRef}
          venues={VENUES}
          activeIndex={venueIndex}
          onSelect={selectVenue}
          idPrefix={tabIdPrefix}
          panelId={panelId}
          labelledBy={headingId}
        />
      </div>
      <VenueLightbox
        venue={activeVenue}
        photoIndex={photoIndex}
        isOpen={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        onStepPhoto={stepPhoto}
      />
    </section>
  );
}
