import {
  PROJECTED_FADE_VP,
  PROJECTED_INTERACTIVE_VISIBILITY,
  PROJECTED_LISTEN_FROM_VP,
  PROJECTED_SCREEN_HEIGHT_PX,
  PROJECTED_SCREEN_WIDTH_PX,
  PROJECTED_VISIBILITY_DECIMALS,
  PROJECTED_VISIBLE_FROM_VP,
  PROJECTED_VISIBLE_TO_VP,
} from 'constants/jukebox3d';
import type { JukeboxSection } from 'constants/jukeboxUi';
import type { ScreenQuad } from 'features/stage';
import { boxToQuadHomography, homographyToMatrix3d } from 'lib/homography';
import { clamp, roundTo } from 'lib/math';

export function projectedMode(vp: number): JukeboxSection {
  return vp < PROJECTED_LISTEN_FROM_VP ? 'sing' : 'listen';
}

type Corner = ScreenQuad['topLeft'];

// Positive when a -> b -> c turns clockwise on screen (y down).
const turn = (a: Corner, b: Corner, c: Corner) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

// The display faces the camera (a spinning model shows its back for a while) and is a proper
// convex quad: every corner turns the same way. A collapsed quad has no box to warp onto.
export function isFrontFacing({
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
}: ScreenQuad): boolean {
  return (
    turn(topLeft, topRight, bottomRight) > 0 &&
    turn(topRight, bottomRight, bottomLeft) > 0 &&
    turn(bottomRight, bottomLeft, topLeft) > 0 &&
    turn(bottomLeft, topLeft, topRight) > 0
  );
}

// 0..1: fades in towards the karaoke page, out past the jukebox page, and is 0 while there
// is no display to sit on. Hidden (0) always means inert.
export function projectedVisibility(
  vp: number,
  quad: ScreenQuad | null,
): number {
  if (!quad || !isFrontFacing(quad)) return 0;
  const fadeIn = (vp - PROJECTED_VISIBLE_FROM_VP) / PROJECTED_FADE_VP;
  const fadeOut = (PROJECTED_VISIBLE_TO_VP - vp) / PROJECTED_FADE_VP;
  return roundTo(
    clamp(fadeIn, 0, 1) * clamp(fadeOut, 0, 1),
    PROJECTED_VISIBILITY_DECIMALS,
  );
}

export function isProjectedInteractive(visibility: number): boolean {
  return visibility > PROJECTED_INTERACTIVE_VISIBILITY;
}

type ProjectedPlacement = {
  opacity: number;
  // CSS transform warping the display box onto the quad; null while it is hidden.
  transform: string | null;
};

const HIDDEN: ProjectedPlacement = { opacity: 0, transform: null };

export function projectedPlacement(
  vp: number,
  quad: ScreenQuad | null,
): ProjectedPlacement {
  const opacity = projectedVisibility(vp, quad);
  if (!quad || opacity <= 0) return HIDDEN;
  const homography = boxToQuadHomography(
    PROJECTED_SCREEN_WIDTH_PX,
    PROJECTED_SCREEN_HEIGHT_PX,
    quad,
  );
  if (!homography) return HIDDEN;
  return { opacity, transform: homographyToMatrix3d(homography) };
}
