import { createContext, ReactNode, useContext, useMemo } from 'react';

import { generateLavaBlobs, LavaBlob } from 'components/lavaBlobs';

interface LavaLampContextValue {
  blobs: LavaBlob[];
  /**
   * performance.now() timestamp (ms) at which blobs were generated.
   * Used by phaseDelay() so every LavaField — regardless of when it mounts —
   * joins the animation at the correct cycle position, making blobs appear to
   * have been running continuously since page load.
   */
  startTime: number;
  /** Per-page-load random seed — shared so section LavaFields can derive unique seeds. */
  sessionSeed: number;
}

const LavaLampContext = createContext<LavaLampContextValue>({
  blobs: [],
  startTime: 0,
  sessionSeed: 0,
});

/*
 * Seed and start-time live outside React so StrictMode's double-invocation
 * doesn't generate a different seed the second time, and so the timestamp
 * isn't reset on any re-render.
 */
const SESSION_SEED  = Math.random();
const SESSION_START = performance.now();

export const LavaLampProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<LavaLampContextValue>(() => ({
    blobs:       generateLavaBlobs(SESSION_SEED),
    startTime:   SESSION_START,
    sessionSeed: SESSION_SEED,
  }), []);

  return (
    <LavaLampContext.Provider value={value}>
      {children}
    </LavaLampContext.Provider>
  );
};

export const useLavaLamp = () => useContext(LavaLampContext);

/**
 * Convert a blob's logical delay into a Framer Motion `delay` value that
 * places the animation at the correct cycle phase when a component mounts.
 *
 * A negative FM delay means "start the animation N seconds in the past",
 * which is exactly what we need when the blob has been logically running
 * since app start but is only now being rendered.
 */
export function phaseDelay(blob: LavaBlob, startTime: number): number {
  const elapsedS = (performance.now() - startTime) / 1000;
  // Use blob.delay as a phase offset: each blob is at a different random
  // position in its cycle. Always returns a negative FM delay so the
  // animation starts immediately, mid-cycle at the correct phase.
  const totalAge = elapsedS + blob.delay;
  const phase = ((totalAge % blob.duration) + blob.duration) % blob.duration;
  return -phase;
}
