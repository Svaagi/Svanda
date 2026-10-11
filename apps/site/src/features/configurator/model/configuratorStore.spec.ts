import { JUKEBOX_CONFIG_DEFAULTS, jukeboxConfigSchema } from '@svanda/shared';
import { renderHook } from '@testing-library/react';
import {
  CONFIGURATOR_STORAGE_KEY,
  CONFIGURATOR_STORAGE_VERSION,
} from 'constants/configurator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createInitialConfiguratorValues,
  useConfiguratorStore,
} from './configuratorStore';
import { useConfiguratorHydration } from './useConfiguratorHydration';

const LABELS = {
  design: 'Pixel',
  sections: { sing: 'Karaoke', listen: 'Normal' },
};

const { getState } = useConfiguratorStore;

function storeState(state: unknown, version = CONFIGURATOR_STORAGE_VERSION) {
  window.localStorage.setItem(
    CONFIGURATOR_STORAGE_KEY,
    JSON.stringify({ state, version }),
  );
}

function readStoredState(): unknown {
  const stored = window.localStorage.getItem(CONFIGURATOR_STORAGE_KEY);
  return stored ? (JSON.parse(stored) as { state: unknown }).state : null;
}

async function rehydrate() {
  await useConfiguratorStore.persist.rehydrate();
}

describe('configuratorStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useConfiguratorStore.setState(createInitialConfiguratorValues());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts on the default configuration, pixel design, karaoke section', () => {
    const state = getState();

    expect(state.config).toEqual(JUKEBOX_CONFIG_DEFAULTS);
    expect(state.design).toBe('pixel');
    expect(state.section).toBe('sing');
    expect(state.isPaymentModalShown).toBe(false);
    expect(state.isAttached).toBe(false);
  });

  it('switches design, section and the payment preview', () => {
    getState().setDesign('glass');
    getState().setSection('listen');
    getState().setPaymentModalShown(true);

    expect(getState()).toMatchObject({
      design: 'glass',
      section: 'listen',
      isPaymentModalShown: true,
    });
  });

  describe('setValue', () => {
    it('changes only the design and section being edited', () => {
      getState().setDesign('glass');
      getState().setSection('listen');

      expect(getState().setValue('acc', '#123456')).toBe(true);
      expect(getState().setValue('blur', 4)).toBe(true);
      expect(getState().config.glass.listen).toMatchObject({
        acc: '#123456',
        blur: 4,
      });
      expect(getState().config.glass.sing).toEqual(
        JUKEBOX_CONFIG_DEFAULTS.glass.sing,
      );
      expect(getState().config.pixel).toEqual(JUKEBOX_CONFIG_DEFAULTS.pixel);
    });

    it.each([
      ['an invalid colour', 'acc', 'red'],
      ['a value out of range', 'pixel', 100],
      ['the wrong type', 'glitch', 'yes'],
      ['a setting of the other design', 'blur', 10],
    ] as const)('rejects %s', (_name, key, value) => {
      expect(getState().setValue(key, value)).toBe(false);
      expect(getState().config).toEqual(JUKEBOX_CONFIG_DEFAULTS);
    });
  });

  it('resets only the design and section being edited', () => {
    getState().setValue('acc', '#123456');
    getState().setSection('listen');
    getState().setValue('acc', '#654321');
    getState().resetCurrent();

    expect(getState().config.pixel.listen).toEqual(
      JUKEBOX_CONFIG_DEFAULTS.pixel.listen,
    );
    expect(getState().config.pixel.sing.acc).toBe('#123456');
  });

  describe('JSON export and import', () => {
    it('round-trips the whole configuration', () => {
      getState().setValue('acc', '#123456');
      getState().setDesign('glass');
      getState().setValue('blur', 22);
      const exported = getState().exportJson();
      const edited = getState().config;

      useConfiguratorStore.setState(createInitialConfiguratorValues());
      const result = getState().importJson(exported);

      expect(result.isOk).toBe(true);
      expect(getState().config).toEqual(edited);
      expect(jukeboxConfigSchema.parse(JSON.parse(exported))).toEqual(edited);
    });

    it('reports invalid JSON and keeps the configuration', () => {
      getState().setValue('acc', '#123456');
      const before = getState().config;

      expect(getState().importJson('{oops')).toEqual({
        isOk: false,
        error: 'invalidJson',
      });
      expect(getState().config).toBe(before);
    });

    it('reports an invalid configuration and keeps the configuration', () => {
      expect(getState().importJson('{"pixel":{"sing":{"acc":1}}}')).toEqual({
        isOk: false,
        error: 'invalidConfig',
      });
      expect(getState().config).toEqual(JUKEBOX_CONFIG_DEFAULTS);
    });
  });

  it('exports CSS for both sections of the design being edited', () => {
    getState().setDesign('glass');
    const css = getState().exportCss({ ...LABELS, design: 'Original' });

    expect(css).toContain('/* Original · Normal */\n:root {');
    expect(css).toContain('/* Original · Karaoke */\n.mode-sing {');
    expect(css).toContain('--lava-blur: 10px;');
  });

  it('attaches the configuration only while attached', () => {
    expect(getState().toAttachment()).toBeNull();

    getState().setAttached(true);
    getState().setValue('acc', '#123456');

    expect(getState().isAttached).toBe(true);
    expect(getState().toAttachment()).toEqual(getState().config);

    getState().setAttached(false);

    expect(getState().toAttachment()).toBeNull();
  });

  describe('persistence', () => {
    it('stores the configuration, place and attach state, not the payment preview', () => {
      getState().setValue('acc', '#123456');
      getState().setDesign('glass');
      getState().setAttached(true);
      getState().setPaymentModalShown(true);

      expect(readStoredState()).toEqual({
        config: getState().config,
        design: 'glass',
        section: 'sing',
        isAttached: true,
      });
    });

    it('waits for the hydration hook before reading storage', () => {
      const config = structuredClone(JUKEBOX_CONFIG_DEFAULTS);
      config.pixel.sing.acc = '#abcdef';
      storeState({
        config,
        design: 'glass',
        section: 'listen',
        isAttached: true,
      });

      expect(getState().config).toEqual(JUKEBOX_CONFIG_DEFAULTS);

      renderHook(() => useConfiguratorHydration());

      expect(getState()).toMatchObject({
        config,
        design: 'glass',
        section: 'listen',
        isAttached: true,
      });
    });

    it('keeps the live state when a later rehydrate finds nothing stored', async () => {
      await rehydrate();
      getState().setValue('acc', '#123456');
      getState().setDesign('glass');
      window.localStorage.clear();

      await rehydrate();

      expect(getState().config.pixel.sing.acc).toBe('#123456');
      expect(getState().design).toBe('glass');
    });

    it('keeps the valid fields of corrupted stored state', async () => {
      storeState({
        config: { pixel: { sing: { acc: '#abcdef', pixel: 999 } }, neon: {} },
        design: 'neon',
        section: 'listen',
        isAttached: 'yes',
      });

      await rehydrate();

      expect(getState().config.pixel.sing).toEqual({
        ...JUKEBOX_CONFIG_DEFAULTS.pixel.sing,
        acc: '#abcdef',
      });
      expect(getState()).toMatchObject({
        design: 'pixel',
        section: 'listen',
        isAttached: false,
      });
    });

    it('migrates state stored by an older version', async () => {
      storeState(
        {
          config: { glass: { listen: { now: '#010203' } } },
          design: 'glass',
          isAttached: true,
          retiredField: 1,
        },
        0,
      );

      await rehydrate();

      expect(getState().config.glass.listen.now).toBe('#010203');
      expect(getState()).toMatchObject({
        design: 'glass',
        section: 'sing',
        isAttached: true,
      });
      expect(getState()).not.toHaveProperty('retiredField');
    });

    it('ignores stored data that is not JSON', async () => {
      window.localStorage.setItem(CONFIGURATOR_STORAGE_KEY, '{not json');

      await rehydrate().catch(() => undefined);

      expect(getState().config).toEqual(JUKEBOX_CONFIG_DEFAULTS);
    });

    it('works with defaults when storage throws', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });

      await rehydrate();

      expect(getState().config).toEqual(JUKEBOX_CONFIG_DEFAULTS);
      expect(getState().setValue('acc', '#123456')).toBe(true);
      expect(getState().config.pixel.sing.acc).toBe('#123456');
    });
  });
});
