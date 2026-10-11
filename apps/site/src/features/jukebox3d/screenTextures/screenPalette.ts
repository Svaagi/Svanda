import {
  SCREEN_BACKGROUND_VAR,
  SCREEN_LOGO_COLOR_VARS,
  VU_BAR_COLOR_VARS,
  VU_BAR_OFF_VAR,
} from 'constants/jukebox3d';
import { readCssVar } from 'utils';

export type ScreenPalette = {
  background: string;
  vuOff: string;
  logo: readonly string[];
  vu: readonly string[];
};

// Canvas needs real colour values: resolve the tokens once when the scene mounts.
export function readScreenPalette(root: Element): ScreenPalette {
  const read = (name: string) => readCssVar(root, name);
  return {
    background: read(SCREEN_BACKGROUND_VAR),
    vuOff: read(VU_BAR_OFF_VAR),
    logo: SCREEN_LOGO_COLOR_VARS.map(read),
    vu: VU_BAR_COLOR_VARS.map(read),
  };
}
