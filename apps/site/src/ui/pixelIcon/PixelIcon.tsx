import {
  CURRENT_COLOR_PALETTE,
  ICON_CELL_INSET_PX,
  ICON_CELL_PX,
} from 'constants/pixel';
import { MOON, pixelBitmap, SUN } from 'lib/pixel';
import { useMemo } from 'react';
import { PixelGrid } from 'ui/pixelGrid';

const ICON_BITMAPS = { sun: SUN, moon: MOON } as const;

type PixelIconName = keyof typeof ICON_BITMAPS;

// Decorative: the control it sits in carries the accessible name.
export interface PixelIconProps {
  name: PixelIconName;
  cellSize?: number;
  testId?: string;
}

export function PixelIcon({
  name,
  cellSize = ICON_CELL_PX,
  testId = 'pixel-icon',
}: PixelIconProps) {
  const layout = useMemo(
    () =>
      pixelBitmap(
        ICON_BITMAPS[name],
        cellSize,
        ICON_CELL_INSET_PX,
        CURRENT_COLOR_PALETTE,
      ),
    [name, cellSize],
  );

  return <PixelGrid layout={layout} testId={testId} />;
}
