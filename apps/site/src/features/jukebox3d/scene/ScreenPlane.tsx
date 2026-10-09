import { SCREEN_FACE_Z, SCREEN_POLYGON_OFFSET } from 'constants/jukebox3d';
import type { Bounds } from 'lib/geometry';
import { HALF } from 'lib/math';
import type { Texture } from 'three';

export type ScreenPlaneProps = {
  rect: Bounds;
  texture: Texture;
};

// A textured panel on the cabinet glass. The lift and the polygon offset keep it from
// z-fighting with the glass mesh under it, which flickers at small scales.
export function ScreenPlane({ rect, texture }: ScreenPlaneProps) {
  const { minX, maxX, minY, maxY } = rect;

  return (
    <mesh
      position={[(minX + maxX) * HALF, (minY + maxY) * HALF, SCREEN_FACE_Z]}
    >
      <planeGeometry args={[maxX - minX, maxY - minY]} />
      <meshBasicMaterial
        map={texture}
        polygonOffset
        polygonOffsetFactor={SCREEN_POLYGON_OFFSET}
        polygonOffsetUnits={SCREEN_POLYGON_OFFSET}
      />
    </mesh>
  );
}
