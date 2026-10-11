import {
  LETTER_COLORS,
  LOGO_CELL_INSET_PX,
  LOGO_CELL_PX,
} from 'constants/pixel';
import { BITMAP, pixelBitmap } from 'lib/pixel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelGrid } from 'ui/pixelGrid';

export interface PixelLogoProps {
  cellSize?: number;
  testId?: string;
}

export function PixelLogo({
  cellSize = LOGO_CELL_PX,
  testId = 'pixel-logo',
}: PixelLogoProps) {
  const { t } = useTranslation();
  const layout = useMemo(
    () => pixelBitmap(BITMAP, cellSize, LOGO_CELL_INSET_PX, LETTER_COLORS),
    [cellSize],
  );

  return <PixelGrid layout={layout} label={t('brand.name')} testId={testId} />;
}
