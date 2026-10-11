import { act, screen } from '@testing-library/react';
import { useStageStore } from 'features/stage';
import { renderAtPath } from 'utils/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { ProductPanel } from './ProductPanel';

const setViewport = (width: number, height: number) =>
  useStageStore.setState({
    viewport: { width, height, isMobile: false, isPortrait: height > width },
  });

describe('ProductPanel', () => {
  afterEach(() => {
    useStageStore.setState({
      viewport: { width: 0, height: 0, isMobile: false, isPortrait: false },
      modelAnchors: { heroTextTop: null, karaoke: null, jukebox: null },
    });
  });

  it('renders the heading, title and body of the active locale', () => {
    setViewport(1280, 800);
    renderAtPath(<ProductPanel productId="karaoke" />, '/en');

    expect(screen.getByRole('heading', { level: 2, name: 'KARAOKE' })).toBe(
      screen.getByTestId('product-panel-karaoke-heading'),
    );
    expect(screen.getByRole('region', { name: 'KARAOKE' })).toBe(
      screen.getByTestId('product-panel-karaoke'),
    );
    expect(screen.getByTestId('product-panel-karaoke-title')).toHaveTextContent(
      'Sing it the way it sounds on the radio.',
    );
    expect(screen.getByTestId('product-panel-karaoke-body')).toHaveTextContent(
      /^Every song in the library/,
    );
  });

  it('puts the jukebox copy in the half opposite the karaoke copy', () => {
    setViewport(1280, 800);
    renderAtPath(
      <>
        <ProductPanel productId="karaoke" />
        <ProductPanel productId="jukebox" />
      </>,
      '/sk',
    );

    expect(screen.getByTestId('product-panel-karaoke')).toHaveAttribute(
      'data-side',
      'start',
    );
    expect(screen.getByTestId('product-panel-jukebox')).toHaveAttribute(
      'data-side',
      'end',
    );
    expect(screen.getByTestId('product-panel-jukebox-title')).toHaveTextContent(
      'Vyber skladbu a hraj!',
    );
  });

  it('publishes its model slot only once the viewport turns portrait', () => {
    setViewport(1280, 800);
    renderAtPath(<ProductPanel productId="jukebox" />, '/');
    expect(useStageStore.getState().modelAnchors.jukebox).toBeNull();

    act(() => setViewport(390, 844));
    expect(useStageStore.getState().modelAnchors.jukebox).not.toBeNull();
  });
});
