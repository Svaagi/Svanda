import { describe, expect, it } from 'vitest';

import { JUKEBOX_CONFIG_DEFAULTS } from './jukeboxConfigDefaults.js';
import { mergeJukeboxConfig } from './jukeboxConfigMerge.js';

describe('mergeJukeboxConfig', () => {
  it('takes valid settings from the source', () => {
    const merged = mergeJukeboxConfig(JUKEBOX_CONFIG_DEFAULTS, {
      pixel: { listen: { acc: '#123456', pixel: 20 } },
      glass: { sing: { animate: false } },
    });

    expect(merged.pixel.listen.acc).toBe('#123456');
    expect(merged.pixel.listen.pixel).toBe(20);
    expect(merged.glass.sing.animate).toBe(false);
    expect(merged.pixel.sing).toEqual(JUKEBOX_CONFIG_DEFAULTS.pixel.sing);
  });

  it('keeps the base for invalid, unknown or missing settings', () => {
    const merged = mergeJukeboxConfig(JUKEBOX_CONFIG_DEFAULTS, {
      pixel: { sing: { acc: 'red', speed: 99, neon: true, txt: '#000000' } },
    });

    expect(merged.pixel.sing).toEqual({
      ...JUKEBOX_CONFIG_DEFAULTS.pixel.sing,
      txt: '#000000',
    });
    expect(merged.pixel.sing).not.toHaveProperty('neon');
  });

  it.each([null, 'text', 42, [], { pixel: 'x' }, { pixel: { sing: [] } }])(
    'returns the base for %j',
    (source) => {
      expect(mergeJukeboxConfig(JUKEBOX_CONFIG_DEFAULTS, source)).toEqual(
        JUKEBOX_CONFIG_DEFAULTS,
      );
    },
  );

  it('does not mutate the base', () => {
    const base = structuredClone(JUKEBOX_CONFIG_DEFAULTS);
    mergeJukeboxConfig(base, { pixel: { sing: { acc: '#123456' } } });

    expect(base).toEqual(JUKEBOX_CONFIG_DEFAULTS);
  });
});
