import type { Bitmap } from './glyphs';

// The SVANDA wordmark, 36 x 5 modules.
export const BITMAP: Bitmap = [
  '.###..#...#...##...#...#..###....##.',
  '#.....#...#..#..#..##..#..#..#..#..#',
  '.##....#.#...####..#.#.#..#..#..####',
  '...#...#.#...#..#..#..##..#..#..#..#',
  '###.....#....#..#..#...#..###...#..#',
];

export const SUN: Bitmap = ['#.#.#', '.###.', '#####', '.###.', '#.#.#'];

export const MOON: Bitmap = ['..###', '.##..', '.#...', '.##..', '..###'];

// Five-square chevrons on the venue frame edges, 5 x 3.
export const CHEVRON_UP: Bitmap = ['..#..', '.#.#.', '#...#'];

export const CHEVRON_DOWN: Bitmap = ['#...#', '.#.#.', '..#..'];
