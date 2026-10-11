import {
  VENUE_BAND_BOTTOM_RESERVE_ROWS,
  VENUE_BAND_LABEL_HEIGHT_PX,
  VENUE_BAND_LABEL_Y_RATIO,
  VENUE_BAND_LANDSCAPE,
  VENUE_BAND_LINE_PITCH_ROWS,
  VENUE_BAND_PORTRAIT,
  VENUE_BAND_PORTRAIT_TEXT_COL,
  VENUE_BAND_PORTRAIT_TEXT_Y_RATIO,
  VENUE_BAND_RIGHT_MARGIN_COLS,
  VENUE_BAND_TEXT_BELOW_LABEL_ROWS,
  VENUE_BAND_TEXT_X_BACK_COLS,
  VENUE_BAND_TEXT_X_RATIO,
} from 'constants/venues';
import { measureText } from 'lib/pixel';

type BandSize = {
  width: number;
  height: number;
};

// One line of the venue name on the band grid: the first word is the primary line, the rest
// the secondary (dimmer) lines.
type BandTextLine = {
  text: string;
  row: number;
  isPrimary: boolean;
};

export type VenueBandLayout = BandSize & {
  cell: number;
  cols: number;
  rows: number;
  textCol: number;
  lines: readonly BandTextLine[];
  // Where the note and place label goes (px from the slide's top left), or hidden.
  label: { x: number; y: number; isVisible: boolean };
};

const isPortraitSize = ({ width, height }: BandSize) => height > width;

// Whether a point (px from the canvas top left) lies on the diagonal band.
export function isOnBand(x: number, y: number, size: BandSize): boolean {
  const { startRatio, slope, halfRatio } = isPortraitSize(size)
    ? VENUE_BAND_PORTRAIT
    : VENUE_BAND_LANDSCAPE;
  const centreY = startRatio * size.width + slope * x;
  const halfHeight = halfRatio * size.width * Math.hypot(1, slope);
  return Math.abs(y - centreY) <= halfHeight;
}

const textWidth = (text: string) => measureText(text.toUpperCase());

// A word wider than the line breaks by letters.
function splitWord(word: string, maxCols: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const char of word) {
    if (current && textWidth(current + char) > maxCols) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  return current ? [...parts, current] : parts;
}

// Words packed greedily into lines at most `maxCols` grid columns wide.
export function packBandLines(text: string, maxCols: number): string[] {
  const words = text
    .split(' ')
    .filter(Boolean)
    .flatMap((word) =>
      textWidth(word) > maxCols ? splitWord(word, maxCols) : [word],
    );
  const lines: string[] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last && textWidth(`${last} ${word}`) <= maxCols) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

function bandTextLines(text: string, maxCols: number) {
  const [primary = '', ...rest] = text.split(' ');
  return [
    ...packBandLines(primary, maxCols).map((line) => ({
      text: line,
      isPrimary: true,
    })),
    ...packBandLines(rest.join(' '), maxCols).map((line) => ({
      text: line,
      isPrimary: false,
    })),
  ];
}

// The band grid for a canvas of `size` with `cell` px cells, and where the venue name sits on
// it: lower left in landscape, low in portrait, always ending above the bottom chevron. The
// label goes above the name while there is room for it.
export function layoutVenueBand(
  size: BandSize,
  cell: number,
  text: string,
): VenueBandLayout {
  const isPortrait = isPortraitSize(size);
  const cols = Math.ceil(size.width / cell);
  const rows = Math.ceil(size.height / cell);
  const textCol = isPortrait
    ? VENUE_BAND_PORTRAIT_TEXT_COL
    : Math.max(
        0,
        Math.ceil((VENUE_BAND_TEXT_X_RATIO * size.width) / cell) -
          VENUE_BAND_TEXT_X_BACK_COLS,
      );
  const maxCols =
    Math.floor(size.width / cell) - textCol - VENUE_BAND_RIGHT_MARGIN_COLS;
  const textLines = bandTextLines(text, maxCols);

  const labelRow = Math.round((VENUE_BAND_LABEL_Y_RATIO * size.height) / cell);
  const labelRows = Math.ceil(VENUE_BAND_LABEL_HEIGHT_PX / cell) + 1;
  const wantedRow = isPortrait
    ? Math.round((VENUE_BAND_PORTRAIT_TEXT_Y_RATIO * size.height) / cell)
    : labelRow + VENUE_BAND_TEXT_BELOW_LABEL_ROWS;
  const lastRow =
    Math.floor(size.height / cell) - VENUE_BAND_BOTTOM_RESERVE_ROWS;
  const textHeightRows = textLines.length * VENUE_BAND_LINE_PITCH_ROWS - 1;
  const fitRow = lastRow - textHeightRows + 1;
  const startRow = Math.max(0, Math.min(wantedRow, fitRow));
  const labelTopRow = isPortrait
    ? startRow - labelRows
    : Math.min(labelRow, startRow - labelRows);

  return {
    ...size,
    cell,
    cols,
    rows,
    textCol,
    lines: textLines.map((line, index) => ({
      ...line,
      row: startRow + index * VENUE_BAND_LINE_PITCH_ROWS,
    })),
    label: {
      x: textCol * cell,
      y: labelTopRow * cell,
      isVisible: fitRow >= labelRows,
    },
  };
}
