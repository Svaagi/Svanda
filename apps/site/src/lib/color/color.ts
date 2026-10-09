export type Rgb = {
  r: number;
  g: number;
  b: number;
};

const HEX_PREFIX = '#';
const HEX_RADIX = 16;
const CHANNEL_HEX_DIGITS = 2;
const SHORT_HEX_PATTERN = /^#([\da-f])([\da-f])([\da-f])$/i;
const LONG_HEX_PATTERN = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;

// Parses the hex colours theme tokens resolve to (`#rgb` or `#rrggbb`); null otherwise.
export function parseHexColor(value: string): Rgb | null {
  const short = SHORT_HEX_PATTERN.exec(value.trim());
  const channels = short
    ? short.slice(1).map((digit) => digit + digit)
    : LONG_HEX_PATTERN.exec(value.trim())?.slice(1);
  if (!channels) return null;
  const [r = 0, g = 0, b = 0] = channels.map((channel) =>
    Number.parseInt(channel, HEX_RADIX),
  );
  return { r, g, b };
}

export function mixRgb(from: Rgb, to: Rgb, ratio: number): Rgb {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * ratio);
  return { r: mix(from.r, to.r), g: mix(from.g, to.g), b: mix(from.b, to.b) };
}

export function toHexColor({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    value.toString(HEX_RADIX).padStart(CHANNEL_HEX_DIGITS, '0');
  return HEX_PREFIX + channel(r) + channel(g) + channel(b);
}
