import { screen } from '@testing-library/react';
import { STAGE_PAGE_IDS } from 'constants/stage';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the copy of the locale in the URL', () => {
    renderAtPath(<HomePage />, '/en');

    expect(screen.getByTestId('home-page')).toHaveAttribute(
      'data-locale',
      'en',
    );
    expect(screen.getByTestId('home-page-title')).toHaveTextContent(
      'Built from scratch.',
    );
    expect(screen.getByTestId('language-switch')).toBeInTheDocument();
  });

  it('puts five page layers on the stage and the contact section after it', () => {
    renderAtPath(<HomePage />, '/');

    expect(screen.getByTestId('stage-shell')).toBeInTheDocument();
    STAGE_PAGE_IDS.forEach((pageId) => {
      expect(screen.getByTestId(`page-layer-${pageId}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId('contact-section')).toHaveAttribute(
      'id',
      'contact',
    );
  });
});
