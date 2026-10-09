import type { StagePointer } from './stageTypes';

// Width of the -1..1 range.
const NORMALISED_SPAN = 2;

type StageRect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;

// A client position as a stage pointer: -1..1 on both axes with y up, active only inside.
// Outside the stage the last inside position is kept, so the torch fades where it left.
export function toStagePointer(
  clientX: number,
  clientY: number,
  rect: StageRect,
  previous: StagePointer,
): StagePointer {
  if (!rect.width || !rect.height) return { ...previous, isActive: false };
  const x = ((clientX - rect.left) / rect.width) * NORMALISED_SPAN - 1;
  const y = 1 - ((clientY - rect.top) / rect.height) * NORMALISED_SPAN;
  const isInside = x >= -1 && x <= 1 && y >= -1 && y <= 1;
  return isInside ? { x, y, isActive: true } : { ...previous, isActive: false };
}

// Stage px of a pointer on a stage of the given size.
export function stagePointerToPx(
  pointer: StagePointer,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: ((pointer.x + 1) / NORMALISED_SPAN) * width,
    y: ((1 - pointer.y) / NORMALISED_SPAN) * height,
  };
}
