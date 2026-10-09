import {
  PRODUCT_HEADING_LANDSCAPE_MIN_CELL_PX,
  PRODUCT_HEADING_LANDSCAPE_SCALE,
  PRODUCT_HEADING_LANDSCAPE_WIDTH_RATIO,
  PRODUCT_HEADING_MIN_CELL_PX,
  PRODUCT_HEADING_PORTRAIT_WIDTH_RATIO,
  PRODUCT_HEADING_SIDE_MARGIN_PX,
  PRODUCT_HEADING_WIDTH_COLS,
} from 'constants/products';
import type { ModelSlot } from 'features/stage';

type ViewportShape = {
  width: number;
  isPortrait: boolean;
};

// The heading's on-screen size is set in CSS; this whole-pixel cell size, from the same
// formula, keeps its cells crisp.
export function productHeadingCellPx({
  width,
  isPortrait,
}: ViewportShape): number {
  const widthRatio = isPortrait
    ? PRODUCT_HEADING_PORTRAIT_WIDTH_RATIO
    : PRODUCT_HEADING_LANDSCAPE_WIDTH_RATIO;
  const spanPx = Math.min(
    width - PRODUCT_HEADING_SIDE_MARGIN_PX,
    width * widthRatio,
  );
  const cellPx = Math.max(
    PRODUCT_HEADING_MIN_CELL_PX,
    Math.floor(spanPx / PRODUCT_HEADING_WIDTH_COLS),
  );
  if (isPortrait) return cellPx;
  return Math.max(
    PRODUCT_HEADING_LANDSCAPE_MIN_CELL_PX,
    Math.round(cellPx * PRODUCT_HEADING_LANDSCAPE_SCALE),
  );
}

type VerticalRect = Pick<DOMRect, 'top' | 'bottom'>;

// The free band between the heading and the body, in px from the top of the stage, where the
// 3D model centres in portrait.
export function measureModelSlot(
  heading: VerticalRect,
  body: VerticalRect,
  originTop: number,
): ModelSlot {
  return {
    top: heading.bottom - originTop,
    bottom: body.top - originTop,
  };
}
