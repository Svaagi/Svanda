const HEX_INPUT_PATTERN = /^#?[\da-f]{6}$/i;

// What a person typed into a hex field as a stored `#rrggbb` colour, or null when it is not
// six hex digits (with or without the `#`).
export function parseHexInput(text: string): string | null {
  const trimmed = text.trim();
  if (!HEX_INPUT_PATTERN.test(trimmed)) return null;
  return `#${trimmed.replace('#', '')}`.toLowerCase();
}

// How a hex field shows a colour.
export const formatHex = (color: string): string => color.toUpperCase();
