import {
  CAMERA_FIT_WIDTH_LANDSCAPE,
  CAMERA_FIT_WIDTH_PORTRAIT,
  CAMERA_FOV_DEG,
  CAMERA_MIN_DISTANCE,
} from 'constants/jukebox3d';
import { HALF } from 'lib/math';

export type SceneSize = {
  width: number;
  height: number;
};

const DEGREES_PER_HALF_TURN = 180;
const HALF_FOV_TAN = Math.tan(
  (CAMERA_FOV_DEG * HALF * Math.PI) / DEGREES_PER_HALF_TURN,
);

export const isPortraitSize = ({ width, height }: SceneSize) => height > width;

// The camera stays at its minimum distance until the stage gets too narrow to show the fit
// width, then backs off so that width still fits.
export function cameraDistance(size: SceneSize): number {
  if (size.width <= 0 || size.height <= 0) return CAMERA_MIN_DISTANCE;
  const fitWidth = isPortraitSize(size)
    ? CAMERA_FIT_WIDTH_PORTRAIT
    : CAMERA_FIT_WIDTH_LANDSCAPE;
  const aspect = size.width / size.height;
  return Math.max(CAMERA_MIN_DISTANCE, fitWidth / (HALF_FOV_TAN * aspect));
}

// World units one stage px spans at the origin plane.
export function worldUnitsPerPx(size: SceneSize): number {
  if (size.height <= 0) return 0;
  return (cameraDistance(size) * HALF_FOV_TAN) / (size.height * HALF);
}
