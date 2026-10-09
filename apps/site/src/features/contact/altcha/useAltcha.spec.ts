import { CONTACT_MIN_FILL_TIME_MS } from '@svanda/shared';
import { act, renderHook } from '@testing-library/react';
import { CONTACT_FILL_TIME_MARGIN_MS } from 'constants/contact';
import { MS_PER_S } from 'constants/time';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toAltchaFailure } from './altchaError';
import { solveChallenge } from './altchaSolver';
import { useAltcha } from './useAltcha';

vi.mock('./altchaSolver', () => ({ solveChallenge: vi.fn() }));

const solveMock = vi.mocked(solveChallenge);
const FILL_TIME_MS = CONTACT_MIN_FILL_TIME_MS + CONTACT_FILL_TIME_MARGIN_MS;
const LIFETIME_S = 600;

const challengeResponse = (nonce: string) => {
  const issuedAt = Date.now();
  return new Response(
    JSON.stringify({
      parameters: {
        algorithm: 'PBKDF2/SHA-256',
        nonce,
        salt: 'cd',
        cost: 1,
        keyLength: 32,
        keyPrefix: '00',
        expiresAt: issuedAt / MS_PER_S + LIFETIME_S,
        data: { issuedAt },
      },
    }),
  );
};

const solvedNonces = () =>
  solveMock.mock.calls.map(([challenge]) => challenge.parameters.nonce);

async function renderAltcha() {
  const hook = renderHook(() => useAltcha());
  await act(() => vi.advanceTimersByTimeAsync(0));
  return hook;
}

describe('useAltcha', () => {
  const fetchMock = vi.fn<() => Promise<Response>>();

  beforeEach(() => {
    vi.useFakeTimers();
    let issuedCount = 0;
    fetchMock.mockImplementation(() => {
      issuedCount += 1;
      return Promise.resolve(challengeResponse(`nonce-${issuedCount}`));
    });
    vi.stubGlobal('fetch', fetchMock);
    solveMock.mockImplementation((challenge) =>
      Promise.resolve(`payload-${challenge.parameters.nonce}`),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    solveMock.mockReset();
  });

  it('fetches a challenge on mount and solves it only once asked to', async () => {
    const { result } = await renderAltcha();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(solveMock).not.toHaveBeenCalled();

    act(() => {
      result.current.prepare();
      result.current.prepare();
    });
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(solvedNonces()).toEqual(['nonce-1']);
  });

  it('holds the payload back until the minimum fill time passed', async () => {
    const { result } = await renderAltcha();
    let payload: string | undefined;

    void result.current.takePayload().then((solved) => {
      payload = solved;
    });
    await act(() => vi.advanceTimersByTimeAsync(FILL_TIME_MS - 1));
    expect(payload).toBeUndefined();

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(payload).toBe('payload-nonce-1');
  });

  it('uses each challenge for one submit only', async () => {
    const { result } = await renderAltcha();

    const first = result.current.takePayload();
    await act(() => vi.advanceTimersByTimeAsync(FILL_TIME_MS));
    await expect(first).resolves.toBe('payload-nonce-1');

    const second = result.current.takePayload();
    await act(() => vi.advanceTimersByTimeAsync(FILL_TIME_MS));
    await expect(second).resolves.toBe('payload-nonce-2');
  });

  it('replaces a challenge that is about to expire', async () => {
    const { result } = await renderAltcha();

    await act(() => vi.advanceTimersByTimeAsync(LIFETIME_S * MS_PER_S));
    const payload = result.current.takePayload();
    await act(() => vi.advanceTimersByTimeAsync(FILL_TIME_MS));

    await expect(payload).resolves.toBe('payload-nonce-2');
    expect(solvedNonces()).toEqual(['nonce-2']);
  });

  it('asks again when the first challenge could not be fetched', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    const { result } = await renderAltcha();

    const payload = result.current.takePayload();
    await act(() => vi.advanceTimersByTimeAsync(FILL_TIME_MS));

    await expect(payload).resolves.toBe('payload-nonce-1');
    expect(solvedNonces()).toEqual(['nonce-1']);
  });

  it('passes on why no challenge could be fetched', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));
    const { result } = await renderAltcha();

    const error: unknown = await result.current
      .takePayload()
      .catch((reason) => reason);

    expect(toAltchaFailure(error)).toEqual({ reason: 'network' });
    expect(solveMock).not.toHaveBeenCalled();
  });

  it('rejects when the challenge cannot be solved', async () => {
    solveMock.mockRejectedValueOnce(new Error('not solved'));
    const { result } = await renderAltcha();

    await expect(result.current.takePayload()).rejects.toThrow('not solved');
  });

  it('stops solving on unmount', async () => {
    const { result, unmount } = await renderAltcha();
    act(() => result.current.prepare());
    await act(() => vi.advanceTimersByTimeAsync(0));

    unmount();

    const controller = solveMock.mock.calls[0]?.[1];
    expect(controller?.signal.aborted).toBe(true);
  });
});
