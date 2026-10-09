import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { HERO_ROTATION, JUKEBOX_MODEL_URL } from 'constants/jukebox3d';
import { useEffect, useLayoutEffect, useMemo } from 'react';

import { heroPose } from '../sceneLayout';
import { assignJukeboxMaterials, syncEnvironmentMap } from './jukeboxMaterials';
import type { JukeboxPalette } from './jukeboxPalette';
import { useJukeboxMaterials } from './useJukeboxMaterials';

// Meshopt compressed, no Draco: the decoder ships inside the bundle, nothing is fetched
// from a CDN.
const USE_DRACO = false;
const USE_MESHOPT = true;

// Starts the download as soon as the 3D chunk loads, in parallel with the scene setup.
useGLTF.preload(JUKEBOX_MODEL_URL, USE_DRACO, USE_MESHOPT);

export type JukeboxModelProps = {
  palette: JukeboxPalette;
  onReady: () => void;
};

export function JukeboxModel({ palette, onReady }: JukeboxModelProps) {
  const { scene } = useGLTF(JUKEBOX_MODEL_URL, USE_DRACO, USE_MESHOPT);
  const materials = useJukeboxMaterials(palette.shell, palette.glass);
  const size = useThree((state) => state.size);
  const pose = useMemo(() => heroPose(size), [size]);

  useLayoutEffect(() => {
    assignJukeboxMaterials(scene, materials);
  }, [scene, materials]);

  // The environment bakes inside the canvas after mount; pick it up on the frame it lands.
  useFrame(({ scene: root }) =>
    syncEnvironmentMap(materials, root.environment),
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <group
      position={[0, pose.y, 0]}
      rotation={HERO_ROTATION}
      scale={pose.scale}
    >
      <primitive object={scene} />
    </group>
  );
}
