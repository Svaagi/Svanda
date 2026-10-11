import { JUKEBOX_PAGE, KARAOKE_PAGE } from './stage';

export const PRODUCT_IDS = ['karaoke', 'jukebox'] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

// Which half of a landscape page the copy takes; the model stands in the other half.
export type ProductSide = 'start' | 'end';

export type Product = {
  pageIndex: number;
  side: ProductSide;
  // CSS colours (theme tokens) of the pixel heading; they swap with the theme.
  headingColors: readonly string[];
};

export const PRODUCTS: Record<ProductId, Product> = {
  karaoke: {
    pageIndex: KARAOKE_PAGE,
    side: 'start',
    headingColors: ['var(--color-product-karaoke)'],
  },
  jukebox: {
    pageIndex: JUKEBOX_PAGE,
    side: 'end',
    headingColors: ['var(--color-product-jukebox)'],
  },
};

// The pixel heading spans about this share of the viewport width (landscape: half the page,
// portrait: most of it), within the side margins, in cells of at least the minimum size.
export const PRODUCT_HEADING_WIDTH_COLS = 34;
export const PRODUCT_HEADING_LANDSCAPE_WIDTH_RATIO = 0.5;
export const PRODUCT_HEADING_PORTRAIT_WIDTH_RATIO = 0.85;
export const PRODUCT_HEADING_SIDE_MARGIN_PX = 48;
export const PRODUCT_HEADING_MIN_CELL_PX = 6;
// Landscape headings sit beside a large title, so their cells shrink to this share.
export const PRODUCT_HEADING_LANDSCAPE_SCALE = 0.6;
export const PRODUCT_HEADING_LANDSCAPE_MIN_CELL_PX = 4;
