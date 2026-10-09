import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';

import { cameraDistance } from '../sceneLayout';

// Keeps the camera far enough back for the stage size; R3F updates the aspect itself.
export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    camera.position.z = cameraDistance(size);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  return null;
}
