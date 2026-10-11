import { describe, expect, it } from 'vitest';

import { mixHexColors } from './hexColor.js';
import { jukeboxConfigToCss } from './jukeboxConfigCss.js';
import { JUKEBOX_CONFIG_DEFAULTS } from './jukeboxConfigDefaults.js';

// Output of the design prototype's `cssFor` for the default configuration.
const PROTOTYPE_PIXEL_CSS = `/* Pixel · Normal */
:root {
  --base: #12012a;
  --acc: #b6ff4d;
  --now: #ff4fd8;
  --vip: #ffd800;
  --text: #ffffff;
  --acc-hi: #deffaf;
  --acc-lo: #6d992e;
  --acc-mid: #527323;
  --acc-tint: rgba(182,255,77,0.18);
  --acc-ink: #050507;
  --acc-border: #b6ff4d;
  --vip-hi: #ffec80;
  --vip-lo: #a68c00;
  --row-line: #34373e;
  --list-alpha: 0.425;
  --row-alpha: 0.62;
  --modal-alpha: 0.7;
  --lava-1: #ff4fd8;
  --lava-2: #7a5cff;
  --lava-3: #c04fe8;
  --lava-alpha: 0.6;
  --lava-pixel: 12px;
  --lava-speed: 1;
  --lava-glitch: 1;
  --scanlines: 1;
  --lava-animate: 1;
}

/* Pixel · Karaoke */
.mode-sing {
  --base: #05252d;
  --acc: #2fcaca;
  --now: #3ee6ff;
  --vip: #ffd800;
  --text: #ffffff;
  --acc-hi: #a1e7e7;
  --acc-lo: #1c7979;
  --acc-mid: #155b5b;
  --acc-tint: rgba(47,202,202,0.18);
  --acc-ink: #050507;
  --acc-border: #ffffff;
  --vip-hi: #ffec80;
  --vip-lo: #a68c00;
  --row-line: #34373e;
  --list-alpha: 0.425;
  --row-alpha: 0.62;
  --modal-alpha: 0.7;
  --lava-1: #3ee6ff;
  --lava-2: #5ff5e0;
  --lava-3: #2bc4dc;
  --lava-alpha: 0.6;
  --lava-pixel: 12px;
  --lava-speed: 1;
  --lava-glitch: 1;
  --scanlines: 1;
  --lava-animate: 1;
}
`;

const PROTOTYPE_GLASS_CSS = `/* Původní · Normal */
:root {
  --base: #12012a;
  --acc: #ff85c8;
  --now: #e068b2;
  --vip: #ffd36e;
  --text: #ffffff;
  --glass-alpha: 0.16;
  --panel-alpha: 0.11;
  --row-alpha: 0.12;
  --modal-alpha: 1;
  --lava-1: #af54fe;
  --lava-2: #b200e4;
  --lava-3: #d466a0;
  --lava-alpha: 0.7;
  --lava-blur: 10px;
  --lava-speed: 1;
  --lava-animate: 1;
}

/* Původní · Karaoke */
.mode-sing {
  --base: #063d49;
  --acc: #ffd700;
  --now: #ffd809;
  --vip: #ffd36e;
  --text: #ffffff;
  --glass-alpha: 0.16;
  --panel-alpha: 0.11;
  --row-alpha: 0.12;
  --modal-alpha: 1;
  --lava-1: #d4b307;
  --lava-2: #d47b19;
  --lava-3: #c36400;
  --lava-alpha: 0.7;
  --lava-blur: 10px;
  --lava-speed: 1;
  --lava-animate: 1;
}
`;

const SECTIONS = { sing: 'Karaoke', listen: 'Normal' };

describe('jukeboxConfigToCss', () => {
  it('matches the prototype for the pixel design', () => {
    expect(
      jukeboxConfigToCss(JUKEBOX_CONFIG_DEFAULTS, 'pixel', {
        design: 'Pixel',
        sections: SECTIONS,
      }),
    ).toBe(PROTOTYPE_PIXEL_CSS);
  });

  it('matches the prototype for the glass design', () => {
    expect(
      jukeboxConfigToCss(JUKEBOX_CONFIG_DEFAULTS, 'glass', {
        design: 'Původní',
        sections: SECTIONS,
      }),
    ).toBe(PROTOTYPE_GLASS_CSS);
  });

  it('labels the blocks with the given names', () => {
    const css = jukeboxConfigToCss(JUKEBOX_CONFIG_DEFAULTS, 'glass', {
      design: 'Original',
      sections: { sing: 'Karaoke', listen: 'Jukebox' },
    });

    expect(css.startsWith('/* Original · Jukebox */\n:root {')).toBe(true);
    expect(css).toContain('/* Original · Karaoke */\n.mode-sing {');
  });

  it('writes switches as 0 or 1', () => {
    const config = structuredClone(JUKEBOX_CONFIG_DEFAULTS);
    config.pixel.listen = {
      ...config.pixel.listen,
      glitch: false,
      scan: false,
    };
    const css = jukeboxConfigToCss(config, 'pixel', {
      design: 'Pixel',
      sections: SECTIONS,
    });

    expect(css).toContain('--lava-glitch: 0;');
    expect(css).toContain('--scanlines: 0;');
  });
});

describe('mixHexColors', () => {
  it('returns the endpoints at ratio 0 and 1', () => {
    expect(mixHexColors('#102030', '#ffffff', 0)).toBe('#102030');
    expect(mixHexColors('#102030', '#ffffff', 1)).toBe('#ffffff');
  });

  it('mixes halfway and rounds each channel', () => {
    expect(mixHexColors('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
