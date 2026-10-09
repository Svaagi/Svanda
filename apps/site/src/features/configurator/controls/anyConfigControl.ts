import type { GlassUiConfig, PixelUiConfig } from '@svanda/shared';

import type { ConfigControl, ConfigGroup } from '../model';

// A control or group of whichever design is being edited.
export type AnyConfigControl =
  ConfigControl<PixelUiConfig> | ConfigControl<GlassUiConfig>;
export type AnyConfigGroup =
  ConfigGroup<PixelUiConfig> | ConfigGroup<GlassUiConfig>;
