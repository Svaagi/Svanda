export const VENUE_IDS: readonly string[];
export const PHOTOS_PER_VENUE: number;

export function readToken(css: string, name: string): string;

export function placeholderSvg(options: {
  tint: string;
  frame: string;
  color: string;
  seed: number;
  fillRatio: number;
}): string;
