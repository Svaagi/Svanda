import { childTestId } from 'utils';
import type { ModalName } from 'vanilla-cookieconsent';

const MODAL_TEST_IDS: Record<ModalName, string> = {
  consentModal: 'consent-banner',
  preferencesModal: 'consent-preferences',
};

// The library marks each button with `data-role`; specs read them by these names.
const BUTTON_TEST_ID_SUFFIXES: Record<string, string> = {
  all: 'accept-all',
  necessary: 'reject-all',
  show: 'settings',
  save: 'save',
};

// The modals are the library's markup, built outside React, so test ids are added once it
// has rendered them.
export function tagConsentModal(modalName: ModalName, modal: HTMLElement) {
  const testId = MODAL_TEST_IDS[modalName];
  modal.setAttribute('data-testid', testId);
  modal
    .querySelector('.cm__title, .pm__title')
    ?.setAttribute('data-testid', childTestId(testId, 'title'));

  modal.querySelectorAll<HTMLElement>('[data-role]').forEach((button) => {
    const suffix = BUTTON_TEST_ID_SUFFIXES[button.dataset.role ?? ''];
    if (suffix) button.setAttribute('data-testid', childTestId(testId, suffix));
  });

  modal
    .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    .forEach((toggle) => {
      toggle.setAttribute('data-testid', childTestId(testId, toggle.value));
    });
}
