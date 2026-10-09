import { VENUE_SCRAMBLE_GLYPHS } from 'constants/venues';

const NON_SPACE = /\S/g;

// `text` with its first `resolvedCount` characters shown and every later non-space character
// replaced by a random scramble glyph. Spaces stay, so the words keep their shape.
export function scrambleText(
  text: string,
  resolvedCount: number,
  random: () => number = Math.random,
): string {
  const chars = [...text];
  const resolved = chars.slice(0, resolvedCount).join('');
  const scrambled = chars
    .slice(resolvedCount)
    .join('')
    .replace(
      NON_SPACE,
      () =>
        VENUE_SCRAMBLE_GLYPHS[
          Math.floor(random() * VENUE_SCRAMBLE_GLYPHS.length)
        ] ?? '',
    );
  return resolved + scrambled;
}
