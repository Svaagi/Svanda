import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

import { subscribeStageInvalidation } from './stageInvalidation';

export type SceneInvalidationProps = {
  isVisible: boolean;
};

// Renders a frame when the stage changes, and once more when the scene comes back on screen
// (nothing renders while the frameloop is paused).
export function SceneInvalidation({ isVisible }: SceneInvalidationProps) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => subscribeStageInvalidation(invalidate), [invalidate]);

  useEffect(() => {
    if (isVisible) invalidate();
  }, [isVisible, invalidate]);

  return null;
}
