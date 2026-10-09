import { JUKEBOX_SCENE_IDLE_TIMEOUT_MS } from 'constants/jukebox3d';
import { useCallback, useEffect, useState } from 'react';
import { afterLoadIdle } from 'utils';

import { isWebGLAvailable } from './webglSupport';

// poster: prerendered HTML and the first client render; loading: the 3D chunk and the model
// are on their way; ready: the model is on screen; unavailable: no WebGL or the scene failed,
// so the poster stays.
export type JukeboxStatus = 'poster' | 'loading' | 'ready' | 'unavailable';

export function useJukeboxStatus() {
  const [status, setStatus] = useState<JukeboxStatus>('poster');

  // Once the page has loaded and gone idle: the WebGL probe, the 3D chunk and the model then
  // stay clear of the first paint, the LCP image and hydration.
  useEffect(
    () =>
      afterLoadIdle(() => {
        setStatus(isWebGLAvailable(document) ? 'loading' : 'unavailable');
      }, JUKEBOX_SCENE_IDLE_TIMEOUT_MS),
    [],
  );

  const handleReady = useCallback(() => setStatus('ready'), []);
  const handleError = useCallback(() => setStatus('unavailable'), []);

  return { status, handleReady, handleError };
}
