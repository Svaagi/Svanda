import { describe, expect, it } from 'vitest';

import { JUKEBOX_CONFIG_DEFAULTS } from './jukeboxConfigDefaults.js';
import {
  jukeboxConfigPatchSchema,
  jukeboxConfigSchema,
} from './jukeboxConfigSchema.js';

const withPixelSing = (patch: Record<string, unknown>) => ({
  ...JUKEBOX_CONFIG_DEFAULTS,
  pixel: {
    ...JUKEBOX_CONFIG_DEFAULTS.pixel,
    sing: { ...JUKEBOX_CONFIG_DEFAULTS.pixel.sing, ...patch },
  },
});

describe('jukeboxConfigSchema', () => {
  it('accepts the defaults', () => {
    expect(jukeboxConfigSchema.safeParse(JUKEBOX_CONFIG_DEFAULTS).success).toBe(
      true,
    );
  });

  it('accepts upper-case hex colours', () => {
    expect(
      jukeboxConfigSchema.safeParse(withPixelSing({ acc: '#ABCDEF' })).success,
    ).toBe(true);
  });

  it.each([
    ['a short hex', { acc: '#fff' }],
    ['a hex without #', { acc: 'ffffff' }],
    ['a named colour', { acc: 'red' }],
    ['markup', { txt: '<b>#ffffff</b>' }],
    ['a value below its range', { pixel: 5 }],
    ['a value above its range', { modalA: 1.2 }],
    ['a string for a number', { speed: '1' }],
    ['a number for a switch', { glitch: 1 }],
    ['an unknown setting', { blur: 10 }],
  ])('rejects %s', (_name, patch) => {
    expect(jukeboxConfigSchema.safeParse(withPixelSing(patch)).success).toBe(
      false,
    );
  });

  it('rejects a missing setting', () => {
    const { acc: _acc, ...sing } = JUKEBOX_CONFIG_DEFAULTS.pixel.sing;
    const config = {
      ...JUKEBOX_CONFIG_DEFAULTS,
      pixel: { ...JUKEBOX_CONFIG_DEFAULTS.pixel, sing },
    };

    expect(jukeboxConfigSchema.safeParse(config).success).toBe(false);
  });

  it('applies the glass ranges to the glass design', () => {
    const config = {
      ...JUKEBOX_CONFIG_DEFAULTS,
      glass: {
        ...JUKEBOX_CONFIG_DEFAULTS.glass,
        listen: { ...JUKEBOX_CONFIG_DEFAULTS.glass.listen, rowA: 0.6 },
      },
    };

    expect(jukeboxConfigSchema.safeParse(config).success).toBe(false);
  });
});

describe('jukeboxConfigPatchSchema', () => {
  it('accepts a subset of the configuration', () => {
    expect(
      jukeboxConfigPatchSchema.safeParse({
        glass: { sing: { acc: '#123456' } },
      }).success,
    ).toBe(true);
    expect(jukeboxConfigPatchSchema.safeParse({}).success).toBe(true);
  });

  it('rejects an invalid or unknown value in the subset', () => {
    expect(
      jukeboxConfigPatchSchema.safeParse({ glass: { sing: { acc: 'red' } } })
        .success,
    ).toBe(false);
    expect(
      jukeboxConfigPatchSchema.safeParse({ neon: { sing: {} } }).success,
    ).toBe(false);
  });
});
