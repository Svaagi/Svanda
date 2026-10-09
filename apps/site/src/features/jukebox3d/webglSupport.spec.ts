import { afterEach, describe, expect, it, vi } from 'vitest';

import { isWebGLAvailable } from './webglSupport';

type GetContext = HTMLCanvasElement['getContext'];

const mockGetContext = (implementation: (kind: string) => unknown) =>
  vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(implementation as unknown as GetContext);

describe('isWebGLAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is false when the browser has no WebGL context', () => {
    mockGetContext(() => null);

    expect(isWebGLAvailable(document)).toBe(false);
  });

  it('is false when creating a context throws', () => {
    mockGetContext(() => {
      throw new Error('blocked');
    });

    expect(isWebGLAvailable(document)).toBe(false);
  });

  it('falls back to WebGL 1 and releases the probe context', () => {
    const loseContext = vi.fn();
    const getContext = mockGetContext((kind) =>
      kind === 'webgl' ? { getExtension: () => ({ loseContext }) } : null,
    );

    expect(isWebGLAvailable(document)).toBe(true);
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(loseContext).toHaveBeenCalledOnce();
  });
});
