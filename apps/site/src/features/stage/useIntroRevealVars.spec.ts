import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useStageStore } from './stageStore';
import { useIntroRevealVars } from './useIntroRevealVars';

const NAMES = ['--sv-nav', '--sv-menu'] as const;

const renderOnElement = () => {
  const element = document.createElement('div');
  const ref = { current: element };
  const hook = renderHook(() => useIntroRevealVars(ref, NAMES));
  return { element, ...hook };
};

describe('useIntroRevealVars', () => {
  afterEach(() => {
    useStageStore.setState({ introReveal: null });
  });

  it('copies only its own reveal variables onto the element, frame by frame', () => {
    const { element } = renderOnElement();
    expect(element.style.getPropertyValue('--sv-nav')).toBe('');

    act(() => {
      useStageStore.getState().setIntroReveal({
        '--sv-nav': '0.250',
        '--sv-menu': '0.000',
        '--sv-hero': '0.000',
      });
    });
    expect(element.style.getPropertyValue('--sv-nav')).toBe('0.250');
    expect(element.style.getPropertyValue('--sv-menu')).toBe('0.000');
    expect(element.style.getPropertyValue('--sv-hero')).toBe('');

    act(() => {
      useStageStore.getState().setIntroReveal({
        '--sv-nav': '1.000',
        '--sv-menu': '0.500',
      });
    });
    expect(element.style.getPropertyValue('--sv-menu')).toBe('0.500');
  });

  it('hands back to the inherited final values when the intro ends or the hook unmounts', () => {
    useStageStore.getState().setIntroReveal({ '--sv-nav': '0.500' });
    const { element, unmount } = renderOnElement();
    expect(element.style.getPropertyValue('--sv-nav')).toBe('0.500');

    act(() => useStageStore.getState().setIntroReveal(null));
    expect(element.style.getPropertyValue('--sv-nav')).toBe('');

    act(() => {
      useStageStore.getState().setIntroReveal({ '--sv-nav': '0.700' });
    });
    unmount();
    expect(element.style.getPropertyValue('--sv-nav')).toBe('');
  });
});
