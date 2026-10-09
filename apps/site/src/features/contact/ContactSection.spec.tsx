import { screen } from '@testing-library/react';
import { CONTACT_SECTION_ID } from 'constants/stage';
import { renderAtPath } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is the contact anchor, named by its heading, with the form', () => {
    renderAtPath(<ContactSection />, '/en');
    const section = screen.getByTestId('contact-section');

    expect(section).toHaveAttribute('id', CONTACT_SECTION_ID);
    expect(
      screen.getByRole('region', { name: 'Want Svanda at your place?' }),
    ).toBe(section);
    expect(section).toContainElement(
      screen.getByTestId('contact-section-form'),
    );
  });
});
