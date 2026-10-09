import type { Challenge } from 'altcha-lib';
import { solveChallengeWorkers } from 'altcha-lib';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { toAltchaFailure } from './altchaError';
import { encodeAltchaPayload } from './altchaPayload';
import { solveChallenge } from './altchaSolver';

vi.mock('altcha-lib', () => ({ solveChallengeWorkers: vi.fn() }));

const solveWorkersMock = vi.mocked(solveChallengeWorkers);
const challenge: Challenge = {
  parameters: {
    algorithm: 'PBKDF2/SHA-256',
    nonce: 'ab',
    salt: 'cd',
    cost: 1,
    keyLength: 32,
    keyPrefix: '00',
  },
};
const solution = { counter: 3, derivedKey: '00aa' };

const failureOf = (promise: Promise<string>) =>
  promise.then(
    () => null,
    (error: unknown) => toAltchaFailure(error),
  );

describe('solveChallenge', () => {
  afterEach(() => {
    solveWorkersMock.mockReset();
  });

  it('returns the encoded payload of the solution', async () => {
    solveWorkersMock.mockResolvedValue(solution);

    await expect(
      solveChallenge(challenge, new AbortController()),
    ).resolves.toBe(encodeAltchaPayload(challenge, solution));
  });

  it('starts no workers when aborted while the solver loaded', async () => {
    const controller = new AbortController();
    controller.abort();

    expect(await failureOf(solveChallenge(challenge, controller))).toEqual({
      reason: 'not_solved',
    });
    expect(solveWorkersMock).not.toHaveBeenCalled();
  });

  it.each([
    ['finds no solution', () => solveWorkersMock.mockResolvedValue(null)],
    [
      'fails in a worker',
      () => solveWorkersMock.mockRejectedValue(new Error('worker error')),
    ],
  ])('reports a challenge that %s as not solved', async (_label, arrange) => {
    arrange();

    expect(
      await failureOf(solveChallenge(challenge, new AbortController())),
    ).toEqual({ reason: 'not_solved' });
  });
});
