import { CURSOR_LIGHTS } from 'constants/jukebox3d';
import { useReducedMotion } from 'hooks';
import { type ReactNode, useRef } from 'react';
import type { Group, PointLight } from 'three';

import type { JukeboxPalette } from './jukeboxPalette';
import { useJukeboxChoreography } from './useJukeboxChoreography';

export type JukeboxRigProps = {
  palette: JukeboxPalette;
  children: ReactNode;
};

// The pivot the choreography moves the model with, plus the two point lights that follow
// the cursor over the hero (dark until a pointer is there).
export function JukeboxRig({ palette, children }: JukeboxRigProps) {
  const pivotRef = useRef<Group>(null);
  const keyLightRef = useRef<PointLight>(null);
  const tintLightRef = useRef<PointLight>(null);
  const isReducedMotion = useReducedMotion();
  useJukeboxChoreography(
    pivotRef,
    { key: keyLightRef, tint: tintLightRef },
    isReducedMotion,
  );

  return (
    <>
      <group ref={pivotRef}>{children}</group>
      <pointLight
        ref={keyLightRef}
        color={palette.cursor}
        intensity={0}
        distance={CURSOR_LIGHTS.key.distance}
        decay={CURSOR_LIGHTS.key.decay}
      />
      <pointLight
        ref={tintLightRef}
        color={palette.cursor}
        intensity={0}
        distance={CURSOR_LIGHTS.tint.distance}
        decay={CURSOR_LIGHTS.tint.decay}
      />
    </>
  );
}
