import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  fetchChallenge,
  fillTimeRemainingMs,
  isChallengeFresh,
  type IssuedChallenge,
} from './altchaChallenge';
import { solveChallenge } from './altchaSolver';

type Solving = {
  issued: IssuedChallenge;
  controller: AbortController;
  payload: Promise<string>;
};

export type Altcha = {
  // Starts the proof of work, so it is usually done by the time the visitor submits.
  prepare: () => void;
  // The solved payload for one submit, held back until the API's minimum fill time passed.
  // Rejects with an AltchaError when no challenge can be fetched or solved.
  takePayload: () => Promise<string>;
};

const wait = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const ignoreRejection = () => undefined;

// Settles to the challenge, or to null when it could not be fetched.
const settled = (request: Promise<IssuedChallenge>) =>
  request.catch(() => null);

// The challenge is fetched when the form mounts, not at submit: the API measures the minimum
// fill time from when it issued the challenge.
export function useAltcha(): Altcha {
  const issuedRef = useRef<Promise<IssuedChallenge> | null>(null);
  const solvingRef = useRef<Solving | null>(null);

  const requestChallenge = useCallback(() => {
    const request = fetchChallenge();
    // Awaited when needed; a failure there is asked again, so it must not go unhandled now.
    request.catch(ignoreRejection);
    issuedRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    void requestChallenge();
    return () => solvingRef.current?.controller.abort();
  }, [requestChallenge]);

  const freshChallenge = useCallback(async () => {
    const issued = await settled(issuedRef.current ?? requestChallenge());
    if (issued && isChallengeFresh(issued, Date.now())) return issued;

    // A failed or stale challenge is asked for again; this one's failure reaches the caller.
    return requestChallenge();
  }, [requestChallenge]);

  const startSolving = useCallback(async () => {
    const issued = await freshChallenge();
    const current = solvingRef.current;
    if (current?.issued === issued) return current;

    current?.controller.abort();
    const controller = new AbortController();
    const payload = solveChallenge(issued.challenge, controller);
    // Awaited at submit; until then a failure must not surface as an unhandled rejection.
    payload.catch(ignoreRejection);
    const solving = { issued, controller, payload };
    solvingRef.current = solving;
    return solving;
  }, [freshChallenge]);

  const prepare = useCallback(() => {
    startSolving().catch(ignoreRejection);
  }, [startSolving]);

  const takePayload = useCallback(async () => {
    try {
      const { issued, payload } = await startSolving();
      const solved = await payload;
      const remainingMs = fillTimeRemainingMs(issued, Date.now());
      if (remainingMs > 0) await wait(remainingMs);
      return solved;
    } finally {
      // The API redeems each challenge once, so a later submit needs a new one.
      solvingRef.current = null;
      void requestChallenge();
    }
  }, [startSolving, requestChallenge]);

  return useMemo(() => ({ prepare, takePayload }), [prepare, takePayload]);
}
