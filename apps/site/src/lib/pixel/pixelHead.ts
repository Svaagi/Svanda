import {
  CELL_INSET_PX,
  GLYPH_ROWS,
  LINE_CENTRE_RATIO,
  LINE_PITCH_ROWS,
} from 'constants/pixel';

import { layoutText, measureText } from './gridLayout';
import { type PixelLayout, toPixelCells } from './pixelCells';

function wrapWords(
  words: readonly string[],
  maxCols: number,
  isNarrow: boolean,
): string[] {
  const lines: string[] = [];
  words.forEach((word) => {
    const lastLine = lines.at(-1);
    if (lastLine === undefined) {
      lines.push(word);
      return;
    }
    const joined = `${lastLine} ${word}`;
    if (measureText(joined, isNarrow) <= maxCols) {
      lines[lines.length - 1] = joined;
    } else {
      lines.push(word);
    }
  });
  return lines;
}

// A section heading: switches to narrow letters when the full-width text exceeds `maxCols`,
// then wraps by word and centres each line. A single word wider than `maxCols` overflows.
export function pixelHead(
  text: string,
  cellPx: number,
  maxCols: number,
  colors: readonly string[],
): PixelLayout {
  const words = text.toUpperCase().split(' ').filter(Boolean);
  const isNarrow = measureText(words.join(' ')) > maxCols;
  const lines = wrapWords(words, maxCols, isNarrow);
  const widthCols = Math.max(
    0,
    ...lines.map((line) => measureText(line, isNarrow)),
  );
  const gridCells = lines.flatMap((line, lineIndex) =>
    layoutText(line, isNarrow, {
      col: Math.floor(
        (widthCols - measureText(line, isNarrow)) * LINE_CENTRE_RATIO,
      ),
      row: lineIndex * LINE_PITCH_ROWS,
    }),
  );
  const heightRows = Math.max(
    0,
    lines.length * LINE_PITCH_ROWS - (LINE_PITCH_ROWS - GLYPH_ROWS),
  );

  return {
    cells: toPixelCells(gridCells, cellPx, CELL_INSET_PX, colors),
    width: widthCols * cellPx,
    height: heightRows * cellPx,
  };
}
