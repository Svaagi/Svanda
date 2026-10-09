import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialStageValues, useStageStore } from '../stageStore';
import { PageLayer } from './PageLayer';

describe('PageLayer', () => {
  beforeEach(() => {
    useStageStore.setState(createInitialStageValues());
  });

  it('is active and visible on its own page', () => {
    render(<PageLayer pageIndex={0}>content</PageLayer>);
    const layer = screen.getByTestId('page-layer-top');

    expect(layer).toHaveAttribute('data-active', 'true');
    expect(layer).toHaveAttribute('data-visible', 'true');
    expect(layer).not.toHaveAttribute('inert');
    expect(layer).toHaveTextContent('content');
  });

  it('takes no input and hides once faded out on other pages', () => {
    render(<PageLayer pageIndex={2} testId="layer" />);
    const layer = screen.getByTestId('layer');

    expect(layer).toHaveAttribute('data-active', 'false');
    expect(layer).toHaveAttribute('data-visible', 'false');
    expect(layer).toHaveAttribute('inert');
  });

  it('follows the store as the stage pages', () => {
    render(<PageLayer pageIndex={1} />);
    const layer = screen.getByTestId('page-layer-karaoke');

    act(() => useStageStore.setState({ vp: 0.8 }));
    expect(layer).toHaveAttribute('data-visible', 'true');
    expect(layer).toHaveAttribute('data-active', 'false');

    act(() => useStageStore.setState({ page: 1, vp: 1 }));
    expect(layer).toHaveAttribute('data-active', 'true');
  });

  it('passes its index, fade rate and parallax to CSS', () => {
    render(<PageLayer pageIndex={3} fadeRate={1.8} parallaxPx={-90} />);
    const { style } = screen.getByTestId('page-layer-custom');

    expect(style.getPropertyValue('--layer-index')).toBe('3');
    expect(style.getPropertyValue('--layer-fade-rate')).toBe('1.8');
    expect(style.getPropertyValue('--layer-parallax')).toBe('-90px');
  });
});
