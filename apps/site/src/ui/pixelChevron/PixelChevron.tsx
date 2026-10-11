import {
  CELL_INSET_PX,
  CHEVRON_CELL_PX,
  CURRENT_COLOR_PALETTE,
} from 'constants/pixel';
import {
  CHEVRON_DOWN,
  CHEVRON_LEFT,
  CHEVRON_RIGHT,
  CHEVRON_UP,
  pixelBitmap,
} from 'lib/pixel';
import { useMemo } from 'react';
import { PixelGrid } from 'ui/pixelGrid';

const CHEVRON_BITMAPS = {
  up: CHEVRON_UP,
  down: CHEVRON_DOWN,
  left: CHEVRON_LEFT,
  right: CHEVRON_RIGHT,
} as const;

type PixelChevronDirection = keyof typeof CHEVRON_BITMAPS;

// Decorative: the control it sits in carries the accessible name.
export interface PixelChevronProps {
  direction: PixelChevronDirection;
  cellSize?: number;
  testId?: string;
}

export function PixelChevron({
  direction,
  cellSize = CHEVRON_CELL_PX,
  testId = 'pixel-chevron',
}: PixelChevronProps) {
  const layout = useMemo(
    () =>
      pixelBitmap(
        CHEVRON_BITMAPS[direction],
        cellSize,
        CELL_INSET_PX,
        CURRENT_COLOR_PALETTE,
      ),
    [direction, cellSize],
  );

  return <PixelGrid layout={layout} testId={testId} />;
}
