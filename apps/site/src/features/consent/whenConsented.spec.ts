import { afterEach, describe, expect, it, vi } from 'vitest';

import { useConsentStore } from './consentStore';
import { whenConsented } from './whenConsented';

const setAccepted = useConsentStore.getState().setAcceptedCategories;

describe('whenConsented', () => {
  afterEach(() => {
    setAccepted([]);
  });

  it('does not load before consent', () => {
    const load = vi.fn();

    whenConsented('marketing', load);
    setAccepted(['necessary', 'analytics']);

    expect(load).not.toHaveBeenCalled();
  });

  it('loads at once when the category is already consented', () => {
    const load = vi.fn();
    setAccepted(['necessary', 'marketing']);

    whenConsented('marketing', load);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads once when consent arrives later', () => {
    const load = vi.fn();

    whenConsented('marketing', load);
    setAccepted(['necessary', 'marketing']);
    setAccepted(['necessary']);
    setAccepted(['necessary', 'marketing']);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('never loads once cancelled', () => {
    const load = vi.fn();

    const cancel = whenConsented('marketing', load);
    cancel();
    setAccepted(['necessary', 'marketing']);

    expect(load).not.toHaveBeenCalled();
  });
});
