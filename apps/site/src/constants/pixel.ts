export const GLYPH_ROWS = 5;
export const GLYPH_GAP_COLS = 1;
export const SPACE_COLS = 2;
// Rows from one wrapped heading line to the next: the glyph plus two empty rows.
export const LINE_PITCH_ROWS = 7;
export const LINE_CENTRE_RATIO = 0.5;

// A filled cell is drawn inset from its grid square so neighbouring cells read as pixels.
export const CELL_INSET_PX = 1;
export const LOGO_CELL_INSET_PX = 0.5;
export const ICON_CELL_INSET_PX = 0;
// Container-query cells fill this share of their square, anchored top left.
export const CQ_CELL_FILL_RATIO = 0.84;
export const CQ_DECIMALS_SCALE = 1000;

export const LOGO_CELL_PX = 5;
export const LOGO_CELL_MOBILE_PX = 4;
export const ICON_CELL_PX = 3;
export const CHEVRON_CELL_PX = 14;

export const PIXEL_CURRENT_COLOR = 'currentColor';
export const CURRENT_COLOR_PALETTE = [PIXEL_CURRENT_COLOR] as const;

// Per-letter wordmark colour tokens; they swap their values with the theme.
export const LETTER_COLOR_VARS = [
  '--color-letter-1',
  '--color-letter-2',
  '--color-letter-3',
  '--color-letter-4',
  '--color-letter-5',
  '--color-letter-6',
] as const;

export const LETTER_COLORS = LETTER_COLOR_VARS.map((name) => `var(${name})`);
