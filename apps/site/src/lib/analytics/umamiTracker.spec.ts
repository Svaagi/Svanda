import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  loadUmamiScript,
  resolveUmamiConfig,
  type UmamiTracker,
} from './umamiTracker';

const DEFAULT_SRC = 'https://stats.example/script.js';
const OTHER_SRC = 'https://other.example/script.js';
const CONFIG = { src: DEFAULT_SRC, websiteId: 'site-id' };

describe('resolveUmamiConfig', () => {
  it('needs a production build and a website id', () => {
    expect(
      resolveUmamiConfig({ isProduction: false, websiteId: 'id' }, DEFAULT_SRC),
    ).toBeNull();
    expect(
      resolveUmamiConfig({ isProduction: true, websiteId: '' }, DEFAULT_SRC),
    ).toBeNull();
    expect(resolveUmamiConfig({ isProduction: true }, DEFAULT_SRC)).toBeNull();
  });

  it('uses the configured script or the default one', () => {
    expect(
      resolveUmamiConfig({ isProduction: true, websiteId: 'id' }, DEFAULT_SRC),
    ).toEqual({ websiteId: 'id', src: DEFAULT_SRC });
    expect(
      resolveUmamiConfig(
        { isProduction: true, websiteId: 'id', src: OTHER_SRC },
        DEFAULT_SRC,
      ),
    ).toEqual({ websiteId: 'id', src: OTHER_SRC });
  });
});

describe('loadUmamiScript', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    delete window.umami;
  });

  const script = () =>
    document.head.querySelector<HTMLScriptElement>(
      `script[src="${DEFAULT_SRC}"]`,
    );

  it('adds the tracker with automatic tracking off', () => {
    loadUmamiScript(CONFIG, vi.fn());

    expect({ ...script()?.dataset }).toEqual({
      websiteId: 'site-id',
      autoTrack: 'false',
      doNotTrack: 'true',
    });
    expect(script()?.defer).toBe(true);
  });

  it('hands over the tracker once the script has loaded', () => {
    const onReady = vi.fn();
    loadUmamiScript(CONFIG, onReady);
    const tracker: UmamiTracker = { track: vi.fn() };
    window.umami = tracker;

    script()?.dispatchEvent(new Event('load'));

    expect(onReady).toHaveBeenCalledWith(tracker);
  });

  it('adds the script once however often it is asked for', () => {
    const first = vi.fn();
    const second = vi.fn();
    loadUmamiScript(CONFIG, first);
    loadUmamiScript(CONFIG, second);
    window.umami = { track: vi.fn() };

    script()?.dispatchEvent(new Event('load'));

    expect(document.head.querySelectorAll('script')).toHaveLength(1);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it('hands over a tracker that has already loaded at once', () => {
    const tracker: UmamiTracker = { track: vi.fn() };
    window.umami = tracker;
    const onReady = vi.fn();

    loadUmamiScript(CONFIG, onReady);

    expect(onReady).toHaveBeenCalledWith(tracker);
    expect(script()).toBeNull();
  });

  it('hands over nothing when the script defines no tracker', () => {
    const onReady = vi.fn();
    loadUmamiScript(CONFIG, onReady);

    script()?.dispatchEvent(new Event('load'));

    expect(onReady).not.toHaveBeenCalled();
  });
});
