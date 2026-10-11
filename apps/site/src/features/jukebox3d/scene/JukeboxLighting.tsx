import { Environment, Lightformer } from '@react-three/drei';
import {
  DIRECTIONAL_LIGHTS,
  HEMISPHERE_INTENSITY,
  SOFTBOX_PANELS,
  SOFTBOX_RESOLUTION,
} from 'constants/jukebox3d';

import type { JukeboxPalette } from './jukeboxPalette';

export type JukeboxLightingProps = {
  palette: JukeboxPalette;
};

// Image based light from a softbox of emissive panels (baked once into the environment map)
// for the clearcoat reflections, plus a key, two coloured rims and a cyan fill.
export function JukeboxLighting({ palette }: JukeboxLightingProps) {
  return (
    <>
      <hemisphereLight
        args={[palette.sky, palette.ground, HEMISPHERE_INTENSITY]}
      />
      {Object.entries(DIRECTIONAL_LIGHTS).map(([name, light]) => (
        <directionalLight
          key={name}
          color={palette[light.color]}
          intensity={light.intensity}
          position={light.position}
        />
      ))}
      <Environment resolution={SOFTBOX_RESOLUTION} frames={1}>
        <color attach="background" args={[palette.softboxBackground]} />
        {SOFTBOX_PANELS.map((panel) => (
          <Lightformer
            key={panel.id}
            form="rect"
            color={palette[panel.color]}
            intensity={panel.intensity}
            scale={panel.scale}
            position={panel.position}
            rotation={panel.rotation}
          />
        ))}
      </Environment>
    </>
  );
}
