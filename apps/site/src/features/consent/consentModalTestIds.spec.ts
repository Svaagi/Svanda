import { describe, expect, it } from 'vitest';

import { tagConsentModal } from './consentModalTestIds';

function buildModal(markup: string) {
  const modal = document.createElement('div');
  modal.innerHTML = markup;
  return modal;
}

describe('tagConsentModal', () => {
  it('tags the banner and its buttons', () => {
    const modal = buildModal(`
      <h2 class="cm__title"></h2>
      <button data-role="all"></button>
      <button data-role="necessary"></button>
      <button data-role="show"></button>
      <button data-role="unknown"></button>
    `);

    tagConsentModal('consentModal', modal);

    expect(modal).toHaveAttribute('data-testid', 'consent-banner');
    expect(modal.querySelector('h2')).toHaveAttribute(
      'data-testid',
      'consent-banner-title',
    );
    expect(
      Array.from(modal.querySelectorAll('button'), (button) =>
        button.getAttribute('data-testid'),
      ),
    ).toEqual([
      'consent-banner-accept-all',
      'consent-banner-reject-all',
      'consent-banner-settings',
      null,
    ]);
  });

  it('tags the preferences toggles by category', () => {
    const modal = buildModal(`
      <button data-role="save"></button>
      <input type="checkbox" value="marketing" />
    `);

    tagConsentModal('preferencesModal', modal);

    expect(modal).toHaveAttribute('data-testid', 'consent-preferences');
    expect(modal.querySelector('button')).toHaveAttribute(
      'data-testid',
      'consent-preferences-save',
    );
    expect(modal.querySelector('input')).toHaveAttribute(
      'data-testid',
      'consent-preferences-marketing',
    );
  });
});
