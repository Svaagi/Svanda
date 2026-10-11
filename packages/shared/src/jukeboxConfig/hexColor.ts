const HEX_RADIX = 16;
const CHANNEL_DIGITS = 2;
const CHANNEL_MAX = 255;
const CHANNEL_PATTERN = /[\da-f]{2}/gi;

// The red, green and blue channels (0..255) of a `#rrggbb` colour.
const hexToRgb = (hex: string): number[] =>
  Array.from(hex.matchAll(CHANNEL_PATTERN), ([pair]) =>
    Number.parseInt(pair, HEX_RADIX),
  );

const toHexChannel = (value: number) =>
  Math.max(0, Math.min(CHANNEL_MAX, Math.round(value)))
    .toString(HEX_RADIX)
    .padStart(CHANNEL_DIGITS, '0');

// `from` moved toward `to` by `ratio` (0..1), per channel, as `#rrggbb`.
export function mixHexColors(from: string, to: string, ratio: number): string {
  const end = hexToRgb(to);
  const channels = hexToRgb(from).map((value, index) =>
    toHexChannel(value + ((end[index] ?? value) - value) * ratio),
  );

  return `#${channels.join('')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex).join(',')},${alpha})`;
}
