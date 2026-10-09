import { act, renderHook } from '@testing-library/react';
import {
  LIGHT_SCHEME_QUERY,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from 'constants/theme';
import { createMatchMediaMock } from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTheme } from './useTheme';

const appliedTheme = () =>
  document.documentElement.getAttribute(THEME_ATTRIBUTE);

function stubSystemTheme(prefersLight: boolean) {
  const mock = createMatchMediaMock(prefersLight ? [LIGHT_SCHEME_QUERY] : []);
  vi.stubGlobal('matchMedia', mock.matchMedia);
  return mock;
}

describe('useTheme', () => {
  beforeEach(() => {
    stubSystemTheme(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it('defaults to dark', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(appliedTheme()).toBe('dark');
  });

  it('defaults to dark when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(renderHook(() => useTheme()).result.current.theme).toBe('dark');
  });

  it('follows a light system preference', () => {
    stubSystemTheme(true);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(appliedTheme()).toBe('light');
  });

  it('tracks system changes until the visitor chooses', () => {
    const system = stubSystemTheme(false);
    const { result } = renderHook(() => useTheme());

    act(() => system.setMatches(LIGHT_SCHEME_QUERY, true));
    expect(result.current.theme).toBe('light');

    act(() => result.current.setTheme('dark'));
    act(() => system.setMatches(LIGHT_SCHEME_QUERY, false));
    act(() => system.setMatches(LIGHT_SCHEME_QUERY, true));
    expect(result.current.theme).toBe('dark');
  });

  it('prefers a persisted choice over the system preference', () => {
    stubSystemTheme(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    expect(renderHook(() => useTheme()).result.current.theme).toBe('dark');
  });

  it('ignores an invalid persisted value', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(renderHook(() => useTheme()).result.current.theme).toBe('dark');
  });

  it('toggles, applies and persists the choice', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe('light');
    expect(appliedTheme()).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('keeps every mounted hook in sync', () => {
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => first.result.current.setTheme('light'));

    expect(second.result.current.theme).toBe('light');
  });

  it('falls back to the system theme and still toggles when storage throws', () => {
    stubSystemTheme(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(appliedTheme()).toBe('dark');
  });

  it('shares one system listener across mounted hooks', () => {
    const system = stubSystemTheme(false);
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    expect(system.listenerCount(LIGHT_SCHEME_QUERY)).toBe(1);

    first.unmount();
    expect(system.listenerCount(LIGHT_SCHEME_QUERY)).toBe(1);

    act(() => system.setMatches(LIGHT_SCHEME_QUERY, true));
    expect(second.result.current.theme).toBe('light');

    second.unmount();
    expect(system.listenerCount(LIGHT_SCHEME_QUERY)).toBe(0);
  });

  it('removes its system listener on unmount', () => {
    const system = stubSystemTheme(false);
    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(system.listenerCount(LIGHT_SCHEME_QUERY)).toBe(0);
  });
});
