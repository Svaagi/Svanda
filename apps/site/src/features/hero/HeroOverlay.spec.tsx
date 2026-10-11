import { fireEvent, screen } from '@testing-library/react';
import { useStageStore } from 'features/stage';
import { track } from 'lib/analytics';
import { createMatchMediaMock, renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroOverlay } from './HeroOverlay';

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  track: vi.fn(),
}));

const PAGE_HEIGHT = 800;
const scrollTo = vi.fn();

describe('HeroOverlay', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('matchMedia', createMatchMediaMock().matchMedia);
    useStageStore.setState({
      viewport: {
        width: 1280,
        height: PAGE_HEIGHT,
        isMobile: false,
        isPortrait: false,
      },
    });
  });

  afterEach(() => {
    scrollTo.mockReset();
    vi.mocked(track).mockClear();
    vi.unstubAllGlobals();
  });

  it('shows the tag and the call to action in the active locale', () => {
    renderAtPath(<HeroOverlay />, '/sk');

    expect(screen.getByTestId('hero-overlay-tag')).toHaveTextContent(
      'KARAOKE JUKEBOX',
    );
    expect(screen.getByTestId('hero-overlay-cta')).toHaveTextContent(
      'PRESKÚMAŤ SVANDU',
    );
  });

  it('is a real link to the karaoke page that pages the stage on click', () => {
    renderAtPath(<HeroOverlay />, '/en');
    const cta = screen.getByTestId('hero-overlay-cta');

    expect(cta.tagName).toBe('A');
    expect(cta).toHaveAttribute('href', '#karaoke');

    fireEvent.click(cta);
    expect(scrollTo).toHaveBeenCalledWith({
      top: PAGE_HEIGHT,
      behavior: 'smooth',
    });
    expect(track).toHaveBeenCalledExactlyOnceWith('cta_click', {
      target: 'hero',
    });
  });

  it('leaves modified clicks to the browser', () => {
    renderAtPath(<HeroOverlay />, '/en');

    fireEvent.click(screen.getByTestId('hero-overlay-cta'), { ctrlKey: true });
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
