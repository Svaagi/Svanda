import type { Challenge } from 'altcha-lib';
import { ALTCHA_MAX_WORKERS } from 'constants/contact';

import { AltchaError } from './altchaError';
import { encodeAltchaPayload } from './altchaPayload';

const createWorker = () =>
  new Worker(new URL('./altchaWorker.ts', import.meta.url), {
    type: 'module',
  });

const notSolved = () => new AltchaError({ reason: 'not_solved' });

// Solves the proof of work in workers and returns the payload the API expects. Rejects with
// an AltchaError when it is aborted or cannot be solved.
export async function solveChallenge(
  challenge: Challenge,
  controller: AbortController,
): Promise<string> {
  // Loaded on demand, so the solver stays out of the initial bundle.
  const { solveChallengeWorkers } = await import('altcha-lib');
  // Aborted while the solver loaded (the form unmounted): start no workers at all.
  if (controller.signal.aborted) throw notSolved();

  const solution = await solveChallengeWorkers({
    challenge,
    controller,
    createWorker,
    concurrency: Math.min(
      navigator.hardwareConcurrency || 1,
      ALTCHA_MAX_WORKERS,
    ),
  }).catch(() => null);
  if (!solution) throw notSolved();

  return encodeAltchaPayload(challenge, solution);
}
