import {
  type Accent,
  ACCENT_ATTRIBUTE,
  DEFAULT_ACCENT,
} from 'constants/accent';
import {
  CURSOR_ATTRIBUTE,
  type CursorMode,
  DEFAULT_CURSOR_MODE,
} from 'constants/cursor';
import { JUKEBOX_PAGE } from 'constants/stage';

type PageAccent = {
  accent: Accent;
  cursorMode: CursorMode;
};

export function pageAccent(page: number): PageAccent {
  return page === JUKEBOX_PAGE
    ? { accent: 'magenta', cursorMode: 'magenta' }
    : { accent: DEFAULT_ACCENT, cursorMode: DEFAULT_CURSOR_MODE };
}

export function applyPageAccent(
  root: HTMLElement,
  { accent, cursorMode }: PageAccent,
) {
  if (accent === DEFAULT_ACCENT) root.removeAttribute(ACCENT_ATTRIBUTE);
  else root.setAttribute(ACCENT_ATTRIBUTE, accent);
  // The cursor attribute exists only while the pixel cursor is on; never switch it on here.
  if (root.hasAttribute(CURSOR_ATTRIBUTE))
    root.setAttribute(CURSOR_ATTRIBUTE, cursorMode);
}
