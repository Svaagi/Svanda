export const ACCENTS = ['orange', 'magenta'] as const;

export type Accent = (typeof ACCENTS)[number];

// The default accent is the theme.css base, so it is applied by removing the attribute.
export const DEFAULT_ACCENT: Accent = 'orange';

export const ACCENT_ATTRIBUTE = 'data-accent';
