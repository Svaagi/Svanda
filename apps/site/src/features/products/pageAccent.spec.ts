import {
  CUSTOM_PAGE,
  HERO_PAGE,
  JUKEBOX_PAGE,
  KARAOKE_PAGE,
} from 'constants/stage';
import { afterEach, describe, expect, it } from 'vitest';

import { applyPageAccent, pageAccent } from './pageAccent';

describe('pageAccent', () => {
  it('switches to magenta on the jukebox page', () => {
    expect(pageAccent(JUKEBOX_PAGE)).toEqual({
      accent: 'magenta',
      cursorMode: 'magenta',
    });
  });

  it('keeps the default orange set on every other page', () => {
    [HERO_PAGE, KARAOKE_PAGE, CUSTOM_PAGE].forEach((page) => {
      expect(pageAccent(page)).toEqual({ accent: 'orange', cursorMode: 'on' });
    });
  });
});

describe('applyPageAccent', () => {
  const root = document.createElement('div');

  afterEach(() => {
    root.removeAttribute('data-accent');
    root.removeAttribute('data-cursor');
  });

  it('sets the magenta accent and cursor, then removes the accent again', () => {
    root.setAttribute('data-cursor', 'on');

    applyPageAccent(root, pageAccent(JUKEBOX_PAGE));
    expect(root).toHaveAttribute('data-accent', 'magenta');
    expect(root).toHaveAttribute('data-cursor', 'magenta');

    applyPageAccent(root, pageAccent(KARAOKE_PAGE));
    expect(root).not.toHaveAttribute('data-accent');
    expect(root).toHaveAttribute('data-cursor', 'on');
  });

  it('never turns the pixel cursor on when it is off', () => {
    applyPageAccent(root, pageAccent(JUKEBOX_PAGE));

    expect(root).not.toHaveAttribute('data-cursor');
  });
});
