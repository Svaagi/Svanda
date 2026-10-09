import { useCallback, useEffect, useState } from 'react';

import { isWebGLAvailable } from './webglSupport';

// poster: prerendered HTML and the first client render; loading: the 3D chunk and the model
// are on their way; ready: the model is on screen; unavailable: no WebGL or the scene failed,
// so the poster stays.
export type JukeboxStatus = 'poster' | 'loading' | 'ready' | 'unavailable';

export function useJukeboxStatus() {
  const [status, setStatus] = useState<JukeboxStatus>('poster');

  // After mount, so the 3D chunk starts loading only after the first paint.
  useEffect(() => {
    setStatus(isWebGLAvailable(document) ? 'loading' : 'unavailable');
  }, []);

  const handleReady = useCallback(() => setStatus('ready'), []);
  const handleError = useCallback(() => setStatus('unavailable'), []);

  return { status, handleReady, handleError };
}
