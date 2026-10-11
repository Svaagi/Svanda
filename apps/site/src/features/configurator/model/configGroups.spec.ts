import {
  GLASS_UI_RANGES,
  type GlassUiConfig,
  JUKEBOX_CONFIG_DEFAULTS,
  JUKEBOX_UI_DESIGNS,
  type JukeboxUiDesign,
  PIXEL_UI_RANGES,
  type PixelUiConfig,
} from '@svanda/shared';
import { catalogs } from 'i18n/catalogs';
import { describe, expect, it } from 'vitest';

import { CONFIG_GROUPS, type ConfigControl } from './configGroups';

const RANGES = { pixel: PIXEL_UI_RANGES, glass: GLASS_UI_RANGES };

type AnyControl = ConfigControl<PixelUiConfig> | ConfigControl<GlassUiConfig>;

function controlsOf(design: JukeboxUiDesign): readonly AnyControl[] {
  const groups: readonly { controls: readonly AnyControl[] }[] =
    CONFIG_GROUPS[design];
  return groups.flatMap((group) => group.controls);
}

describe('CONFIG_GROUPS', () => {
  it.each(JUKEBOX_UI_DESIGNS)(
    'has one control per setting of the %s design',
    (design) => {
      const keys = controlsOf(design).map((control) => control.key);

      expect([...keys].sort()).toEqual(
        Object.keys(JUKEBOX_CONFIG_DEFAULTS[design].sing).sort(),
      );
    },
  );

  it.each(JUKEBOX_UI_DESIGNS)(
    'gives each %s control the kind its value needs',
    (design) => {
      const defaults: Record<string, unknown> =
        JUKEBOX_CONFIG_DEFAULTS[design].sing;
      const valueTypes = {
        color: 'string',
        range: 'number',
        switch: 'boolean',
      };

      controlsOf(design).forEach((control) => {
        expect(typeof defaults[control.key]).toBe(valueTypes[control.kind]);
      });
    },
  );

  it.each(JUKEBOX_UI_DESIGNS)(
    'uses the schema bounds for %s ranges',
    (design) => {
      const ranges: Record<string, unknown> = RANGES[design];

      controlsOf(design).forEach((control) => {
        if (control.kind === 'range') {
          expect(control.range).toBe(ranges[control.key]);
        }
      });
    },
  );

  it('groups both designs into background, effects, buttons and song list', () => {
    JUKEBOX_UI_DESIGNS.forEach((design) => {
      expect(CONFIG_GROUPS[design].map((group) => group.id)).toEqual([
        'background',
        'effects',
        'buttons',
        'songList',
      ]);
    });
  });

  it('offers swatches for the accent and now-playing colours only', () => {
    JUKEBOX_UI_DESIGNS.forEach((design) => {
      const withSwatches = controlsOf(design)
        .filter((control) => control.kind === 'color' && control.hasSwatches)
        .map((control) => control.key);

      expect(withSwatches).toEqual(['acc', 'now']);
    });
  });

  it.each(Object.entries(catalogs))(
    'has a label, and a hint where flagged, in %s',
    (_locale, catalog) => {
      JUKEBOX_UI_DESIGNS.flatMap(controlsOf).forEach((control) => {
        const copy: { label: string; hint?: string } =
          catalog.configurator.controls[control.copyId];
        expect(copy.label).toBeTruthy();
        if (control.hasHint) expect(copy.hint).toBeTruthy();
      });
    },
  );
});
