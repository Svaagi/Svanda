export const CURSOR_MODES = ['on', 'magenta'] as const;

export type CursorMode = (typeof CURSOR_MODES)[number];

export const DEFAULT_CURSOR_MODE: CursorMode = 'on';
