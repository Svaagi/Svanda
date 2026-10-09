import { act, render, screen } from '@testing-library/react';
import { PROJECTED_CUSTOM_VP_RANGE } from 'constants/jukebox3d';
import { type ScreenQuad, useStageStore } from 'features/stage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectedScreen } from './ProjectedScreen';

const QUAD: ScreenQuad = {
  topLeft: { x: 100, y: 50 },
  topRight: { x: 370, y: 50 },
  bottomRight: { x: 370, y: 530 },
  bottomLeft: { x: 100, y: 530 },
};

describe('ProjectedScreen', () => {
  beforeEach(() => {
    useStageStore.setState({ vp: 0, screenQuad: null });
  });

  it('is paused, hidden and inert on the hero', () => {
    const renderContent = vi.fn(() => null);
    render(<ProjectedScreen>{renderContent}</ProjectedScreen>);
    const projected = screen.getByTestId('projected-screen');

    expect(projected).toHaveAttribute('data-paused', 'true');
    expect(projected).toHaveAttribute('data-interactive', 'false');
    expect(projected).toHaveAttribute('inert');
    expect(projected.style.opacity).toBe('0');
    expect(renderContent).toHaveBeenLastCalledWith({
      mode: 'sing',
      isPaused: true,
    });
  });

  it('sits on the display quad and takes input on the product pages', () => {
    const renderContent = vi.fn(() => <p data-testid="content" />);
    render(<ProjectedScreen>{renderContent}</ProjectedScreen>);
    const projected = screen.getByTestId('projected-screen');

    act(() => useStageStore.setState({ vp: 1, screenQuad: QUAD }));

    expect(projected).toHaveAttribute('data-paused', 'false');
    expect(projected).toHaveAttribute('data-interactive', 'true');
    expect(projected).not.toHaveAttribute('inert');
    expect(projected.style.opacity).toBe('1');
    expect(projected.style.transform).toBe(
      'matrix3d(0.5,0,0,0,0,0.5,0,0,0,0,1,0,100,50,0,1)',
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(renderContent).toHaveBeenLastCalledWith({
      mode: 'sing',
      isPaused: false,
    });
  });

  it('shows on the custom page only when given the custom range', () => {
    render(
      <ProjectedScreen vpRange={PROJECTED_CUSTOM_VP_RANGE} testId="custom">
        {() => null}
      </ProjectedScreen>,
    );
    const projected = screen.getByTestId('custom');

    act(() => useStageStore.setState({ vp: 1, screenQuad: QUAD }));
    expect(projected).toHaveAttribute('data-paused', 'true');

    act(() => useStageStore.setState({ vp: 3 }));
    expect(projected).toHaveAttribute('data-interactive', 'true');
    expect(projected.style.opacity).toBe('1');
  });

  it('follows the quad without re-rendering its content', () => {
    useStageStore.setState({ vp: 1.6, screenQuad: QUAD });
    const renderContent = vi.fn(() => null);
    render(<ProjectedScreen>{renderContent}</ProjectedScreen>);
    const projected = screen.getByTestId('projected-screen');
    const renders = renderContent.mock.calls.length;

    act(() =>
      useStageStore.setState({
        screenQuad: {
          ...QUAD,
          topLeft: { x: 110, y: 50 },
          bottomLeft: { x: 110, y: 530 },
        },
      }),
    );

    expect(renderContent).toHaveBeenCalledTimes(renders);
    expect(renderContent).toHaveBeenLastCalledWith({
      mode: 'listen',
      isPaused: false,
    });
    expect(projected.style.transform).toContain(',110,50,0,1)');
  });

  it('shows but ignores input while fading in', () => {
    render(<ProjectedScreen testId="screen" />);
    const projected = screen.getByTestId('screen');

    act(() => useStageStore.setState({ vp: 0.9, screenQuad: QUAD }));

    expect(projected).toHaveAttribute('data-paused', 'false');
    expect(projected).toHaveAttribute('data-interactive', 'false');
    expect(Number(projected.style.opacity)).toBeCloseTo(0.5);
  });

  it('hides again when the display goes away', () => {
    useStageStore.setState({ vp: 1.5, screenQuad: QUAD });
    render(<ProjectedScreen />);
    const projected = screen.getByTestId('projected-screen');

    act(() => useStageStore.setState({ screenQuad: null }));

    expect(projected).toHaveAttribute('data-paused', 'true');
    expect(projected.style.opacity).toBe('0');
  });

  it('stays inert when the display collapses to a line', () => {
    useStageStore.setState({ vp: 1.5, screenQuad: QUAD });
    render(<ProjectedScreen />);
    const projected = screen.getByTestId('projected-screen');

    act(() =>
      useStageStore.setState({
        screenQuad: { ...QUAD, bottomLeft: { x: 370, y: 290 } },
      }),
    );

    expect(projected).toHaveAttribute('data-paused', 'true');
    expect(projected).toHaveAttribute('data-interactive', 'false');
    expect(projected).toHaveAttribute('inert');
    expect(projected.style.opacity).toBe('0');
  });
});
