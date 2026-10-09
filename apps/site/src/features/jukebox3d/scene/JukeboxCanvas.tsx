import { Canvas } from '@react-three/fiber';
import {
  CAMERA_FAR,
  CAMERA_FOV_DEG,
  CAMERA_HEIGHT,
  CAMERA_MIN_DISTANCE,
  CAMERA_NEAR,
  SCENE_DPR_RANGE,
  SCENE_EXPOSURE,
} from 'constants/jukebox3d';
import { Suspense, useRef, useState } from 'react';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';

import { CameraRig } from './CameraRig';
import { JukeboxLighting } from './JukeboxLighting';
import { JukeboxModel } from './JukeboxModel';
import { readJukeboxPalette } from './jukeboxPalette';
import { JukeboxRig } from './JukeboxRig';
import styles from './scene.module.css';
import { SceneInvalidation } from './SceneInvalidation';
import { useIsSceneVisible } from './useIsSceneVisible';

const CAMERA = {
  fov: CAMERA_FOV_DEG,
  near: CAMERA_NEAR,
  far: CAMERA_FAR,
  position: [0, CAMERA_HEIGHT, CAMERA_MIN_DISTANCE],
} as const;

// Constructor options plus renderer properties: R3F applies the latter after creating the
// renderer and skips its own tone mapping and colour space defaults when they are given.
const GL_OPTIONS = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: SCENE_EXPOSURE,
  outputColorSpace: SRGBColorSpace,
} as const;

export type JukeboxCanvasProps = {
  onReady: () => void;
  testId?: string;
};

// The R3F scene. Only ever loaded on the client, through a lazy import: nothing here runs
// while prerendering. Unmounting disposes the renderer and releases its WebGL context.
export function JukeboxCanvas({
  onReady,
  testId = 'jukebox-canvas',
}: JukeboxCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsSceneVisible(hostRef);
  const [palette] = useState(() =>
    readJukeboxPalette(document.documentElement),
  );

  return (
    <div ref={hostRef} className={styles.canvasHost} data-testid={testId}>
      {/* An event source other than the canvas turns the canvas pointer events off: the
          model is decorative and must not catch clicks meant for the page. */}
      <Canvas
        eventSource={hostRef}
        frameloop={isVisible ? 'demand' : 'never'}
        dpr={SCENE_DPR_RANGE}
        gl={GL_OPTIONS}
        camera={CAMERA}
      >
        <CameraRig />
        <SceneInvalidation isVisible={isVisible} />
        <JukeboxLighting palette={palette} />
        <Suspense fallback={null}>
          <JukeboxRig palette={palette}>
            <JukeboxModel palette={palette} onReady={onReady} />
          </JukeboxRig>
        </Suspense>
      </Canvas>
    </div>
  );
}
