import {
  INTRO_BACKGROUND_VAR,
  INTRO_FLASH_VAR,
  INTRO_NOISE_COLOR_VARS,
} from 'constants/intro';
import { LETTER_COLOR_VARS } from 'constants/pixel';
import { readCssVar } from 'utils';

export type IntroPalette = {
  background: string;
  flash: string;
  letters: readonly string[];
  noise: readonly string[];
};

// Canvas needs real colour values: resolve the theme tokens once when the intro starts.
export function readIntroPalette(root: Element): IntroPalette {
  const read = (name: string) => readCssVar(root, name);
  return {
    background: read(INTRO_BACKGROUND_VAR),
    flash: read(INTRO_FLASH_VAR),
    letters: LETTER_COLOR_VARS.map(read),
    noise: INTRO_NOISE_COLOR_VARS.map(read),
  };
}

export function letterColor(palette: IntroPalette, letterIndex: number) {
  return palette.letters[letterIndex % palette.letters.length] ?? palette.flash;
}
