import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { JUKEBOX_MODEL_URL } from 'constants/jukebox3d';
import { useEffect, useLayoutEffect } from 'react';

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

  return <primitive object={scene} />;
}
