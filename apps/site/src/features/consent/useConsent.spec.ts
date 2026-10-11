import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useConsentStore } from './consentStore';
import { useConsent } from './useConsent';

const setAccepted = useConsentStore.getState().setAcceptedCategories;

describe('useConsent', () => {
  afterEach(() => {
    setAccepted([]);
  });

  it('is false until the consent manager reports a choice', () => {
    const { result } = renderHook(() => useConsent('analytics'));

    expect(result.current).toBe(false);
  });

  it('follows the accepted categories', () => {
    const { result } = renderHook(() => useConsent('analytics'));

    act(() => setAccepted(['necessary', 'analytics']));
    expect(result.current).toBe(true);

    act(() => setAccepted(['necessary']));
    expect(result.current).toBe(false);
  });
});
