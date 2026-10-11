import { render, screen, waitFor } from '@testing-library/react';
import { JUKEBOX_POSTER_URL } from 'constants/jukebox3d';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JukeboxStage } from './JukeboxStage';

// jsdom has no WebGL: the real scene is replaced by a stand-in that reports ready on mount
// and tracks its own teardown, which is where R3F disposes the renderer and its context.
const scene = vi.hoisted(() => ({
  dispose: vi.fn(),
  shouldFail: false,
}));

vi.mock('./scene/JukeboxCanvas', () => ({
  JukeboxCanvas: ({
    onReady,
    testId,
  }: {
    onReady: () => void;
    testId: string;
  }) => {
    if (scene.shouldFail) throw new Error('WebGL context lost');
    useEffect(() => {
      onReady();
      return scene.dispose;
    }, [onReady]);
    return <div data-testid={testId} />;
  },
}));

type GetContext = HTMLCanvasElement['getContext'];

const mockWebGL = (isAvailable: boolean) =>
  vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation((() =>
      isAvailable
        ? { getExtension: () => null }
        : null) as unknown as GetContext);

describe('JukeboxStage', () => {
  beforeEach(() => {
    scene.dispose.mockClear();
    scene.shouldFail = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the poster and loads no scene without WebGL', async () => {
    mockWebGL(false);
    render(<JukeboxStage />);

    await waitFor(() =>
      expect(screen.getByTestId('jukebox-stage')).toHaveAttribute(
        'data-state',
        'unavailable',
      ),
    );
    expect(screen.getByTestId('jukebox-stage-poster')).toHaveAttribute(
      'src',
      JUKEBOX_POSTER_URL,
    );
    expect(screen.queryByTestId('jukebox-stage-canvas')).toBeNull();
  });

  it('is decorative', () => {
    mockWebGL(false);
    render(<JukeboxStage />);

    expect(screen.getByTestId('jukebox-stage')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByTestId('jukebox-stage-poster')).toHaveAttribute(
      'alt',
      '',
    );
  });

  it('mounts the scene with WebGL and turns ready once the model is in', async () => {
    mockWebGL(true);
    render(<JukeboxStage />);

    expect(
      await screen.findByTestId('jukebox-stage-canvas'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('jukebox-stage')).toHaveAttribute(
        'data-state',
        'ready',
      ),
    );
  });

  it('tears the scene down on unmount', async () => {
    mockWebGL(true);
    const { unmount } = render(<JukeboxStage />);
    await screen.findByTestId('jukebox-stage-canvas');

    unmount();

    expect(scene.dispose).toHaveBeenCalledOnce();
  });

  it('falls back to the poster when the scene fails', async () => {
    mockWebGL(true);
    scene.shouldFail = true;
    // React reports the caught error; the fallback is what matters here.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<JukeboxStage />);

    await waitFor(() =>
      expect(screen.getByTestId('jukebox-stage')).toHaveAttribute(
        'data-state',
        'unavailable',
      ),
    );
    expect(screen.queryByTestId('jukebox-stage-canvas')).toBeNull();
    expect(screen.getByTestId('jukebox-stage-poster')).toBeInTheDocument();
  });
});
