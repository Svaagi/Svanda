import { CURRENT_COLOR_PALETTE } from 'constants/pixel';
import { pixelHead, pixelWord } from 'lib/pixel';
import { useMemo } from 'react';
import { PixelGrid } from 'ui/pixelGrid';

export interface PixelTextProps {
  text: string;
  cellSize: number;
  // CSS colour values (token references) cycled per letter; defaults to the text colour.
  colors?: readonly string[];
  // Heading mode: wrap and fall back to narrow letters to stay within this many cells.
  maxCols?: number;
  testId?: string;
}

export function PixelText({
  text,
  cellSize,
  colors = CURRENT_COLOR_PALETTE,
  maxCols,
  testId = 'pixel-text',
}: PixelTextProps) {
  const layout = useMemo(
    () =>
      maxCols === undefined
        ? pixelWord(text, cellSize, colors)
        : pixelHead(text, cellSize, maxCols, colors),
    [text, cellSize, colors, maxCols],
  );

  return <PixelGrid layout={layout} label={text} testId={testId} />;
}
