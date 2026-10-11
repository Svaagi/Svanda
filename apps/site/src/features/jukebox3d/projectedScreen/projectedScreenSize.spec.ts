// @vitest-environment node
import { readFileSync } from 'node:fs';

import {
  PROJECTED_SCREEN_HEIGHT_PX,
  PROJECTED_SCREEN_WIDTH_PX,
} from 'constants/jukebox3d';
import { describe, expect, it } from 'vitest';

const theme = readFileSync(
  new URL('../../../styles/theme.css', import.meta.url),
  'utf8',
);

describe('projected screen size', () => {
  it('sizes the CSS box exactly as the homography assumes', () => {
    expect(theme).toContain(
      `--projected-screen-width: ${PROJECTED_SCREEN_WIDTH_PX}px;`,
    );
    expect(theme).toContain(
      `--projected-screen-height: ${PROJECTED_SCREEN_HEIGHT_PX}px;`,
    );
  });
});
