import { JUKEBOX_CONFIG_DEFAULTS } from '@svanda/shared';
import { LOCALES } from 'constants/locales';
import { getI18nInstance } from 'i18n/i18nInstance';
import { describe, expect, it } from 'vitest';

import { CONFIG_IMPORT_ERROR_KEYS, importConfigJson } from './configImport';

describe('importConfigJson', () => {
  it('imports a full export', () => {
    const config = structuredClone(JUKEBOX_CONFIG_DEFAULTS);
    config.glass.listen.acc = '#123456';

    expect(
      importConfigJson(JSON.stringify(config), JUKEBOX_CONFIG_DEFAULTS),
    ).toEqual({ isOk: true, config });
  });

  it('applies a partial export over the base', () => {
    const result = importConfigJson(
      '{"pixel":{"sing":{"pixel":20}}}',
      JUKEBOX_CONFIG_DEFAULTS,
    );

    expect(result.isOk && result.config.pixel.sing.pixel).toBe(20);
    expect(result.isOk && result.config.glass).toEqual(
      JUKEBOX_CONFIG_DEFAULTS.glass,
    );
  });

  it('accepts the design prototype export wrapped in `cfg`', () => {
    const result = importConfigJson(
      JSON.stringify({
        cfg: { pixel: { listen: { acc: '#abcdef' } } },
        ui: { mode: 'sing', design: 'pixel' },
      }),
      JUKEBOX_CONFIG_DEFAULTS,
    );

    expect(result.isOk && result.config.pixel.listen.acc).toBe('#abcdef');
  });

  it.each(['', 'not json', '{"pixel":', "{'pixel':{}}"])(
    'reports invalid JSON for %j',
    (text) => {
      expect(importConfigJson(text, JUKEBOX_CONFIG_DEFAULTS)).toEqual({
        isOk: false,
        error: 'invalidJson',
      });
    },
  );

  it.each([
    '[]',
    '"text"',
    'null',
    '{"pixel":{"sing":{"acc":"red"}}}',
    '{"pixel":{"sing":{"neon":true}}}',
    '{"glass":{"sing":{"pixel":12}}}',
  ])('reports an invalid configuration for %s', (text) => {
    expect(importConfigJson(text, JUKEBOX_CONFIG_DEFAULTS)).toEqual({
      isOk: false,
      error: 'invalidConfig',
    });
  });
});

describe('CONFIG_IMPORT_ERROR_KEYS', () => {
  it.each(LOCALES)('translates every import error in %s', (locale) => {
    const { t } = getI18nInstance(locale);

    Object.values(CONFIG_IMPORT_ERROR_KEYS).forEach((key) => {
      const message = t(key);
      expect(message).toBeTruthy();
      expect(message).not.toBe(key);
    });
  });
});
