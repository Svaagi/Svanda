import {
  DISPLAY_SPLIT_MAX_PERCENT,
  DISPLAY_SPLIT_MIN_PERCENT,
  GLASS_UI_DEFAULTS,
  type GlassUiConfig,
  type JukeboxSection,
  PIXEL_UI_DEFAULTS,
  type PixelUiConfig,
} from 'constants/jukeboxUi';
import { type CSSProperties, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId, classNames } from 'utils';

import { AppIcon } from '../appIcon';
import { GlassJukeboxUi } from '../glass';
import { LavaLamp } from '../lavaLamp';
import { PixelJukeboxUi } from '../pixel';
import styles from './displayCompare.module.css';
import { useDisplayLamps } from './useDisplayLamps';
import { useSplitCompare } from './useSplitCompare';

export type DisplayCompareProps = {
  section: JukeboxSection;
  // Stops both lava lamps (the display is hidden).
  isPaused?: boolean;
  pixelConfig?: PixelUiConfig;
  glassConfig?: GlassUiConfig;
  testId?: string;
};

// Both app designs on one screen, before/after style: pixel on the left of the split, the
// original glass design on the right. Drag anywhere to move the split, or use the arrow
// keys on its handle.
export function DisplayCompare({
  section,
  isPaused = false,
  pixelConfig = PIXEL_UI_DEFAULTS[section],
  glassConfig = GLASS_UI_DEFAULTS[section],
  testId = 'display-compare',
}: DisplayCompareProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { splitPercent, bindDrag, handleKeyDown } = useSplitCompare(surfaceRef);
  const { pixelCanvasRef, glassCanvasRef, pixelLava, glassLava } =
    useDisplayLamps({
      rootRef,
      pixelConfig,
      glassConfig,
      splitPercent,
      isPaused,
    });
  const pixelShare = Math.round(splitPercent);

  return (
    <div
      ref={rootRef}
      className={styles.displayCompare}
      style={{ '--split': `${splitPercent}%` } as CSSProperties}
      role="group"
      aria-label={t('custom.displayLabel')}
      data-testid={testId}
    >
      <PixelJukeboxUi
        section={section}
        config={pixelConfig}
        background={
          <LavaLamp
            settings={pixelLava}
            canvasRef={pixelCanvasRef}
            isPaused={isPaused}
            testId={childTestId(testId, 'pixel-lava')}
          />
        }
      />
      <div className={styles.glassLayer}>
        <GlassJukeboxUi
          section={section}
          config={glassConfig}
          background={
            <LavaLamp
              settings={glassLava}
              canvasRef={glassCanvasRef}
              isPaused={isPaused}
              testId={childTestId(testId, 'glass-lava')}
            />
          }
        />
      </div>
      <div
        ref={surfaceRef}
        className={styles.dragSurface}
        {...bindDrag()}
        data-testid={childTestId(testId, 'surface')}
      />
      <div className={styles.split}>
        <span
          className={classNames(styles.label, styles.labelPixel)}
          aria-hidden="true"
        >
          {t('configurator.design.pixelBadge')}
        </span>
        <span
          className={classNames(styles.label, styles.labelGlass)}
          aria-hidden="true"
        >
          {t('configurator.design.glassBadge')}
        </span>
        <div
          className={styles.handle}
          role="slider"
          tabIndex={0}
          aria-label={t('jukeboxUi.compare.handle')}
          aria-orientation="horizontal"
          aria-valuemin={DISPLAY_SPLIT_MIN_PERCENT}
          aria-valuemax={DISPLAY_SPLIT_MAX_PERCENT}
          aria-valuenow={pixelShare}
          aria-valuetext={t('jukeboxUi.compare.value', {
            pixel: pixelShare,
            original: DISPLAY_SPLIT_MAX_PERCENT - pixelShare,
          })}
          onKeyDown={handleKeyDown}
          data-testid={childTestId(testId, 'handle')}
        >
          <AppIcon name="split" className={styles.handleIcon} />
        </div>
      </div>
    </div>
  );
}
