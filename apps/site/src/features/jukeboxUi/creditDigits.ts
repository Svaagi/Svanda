import { type Bitmap, FILLED_PIXEL } from 'lib/pixel';

// The app's credit counter font: 4 x 5 cells per digit (`#` lit).
const DIGIT_BITMAPS: Readonly<Record<string, Bitmap>> = {
  '0': ['.##.', '#..#', '#..#', '#..#', '.##.'],
  '1': ['.#..', '##..', '.#..', '.#..', '###.'],
  '2': ['.##.', '#..#', '..#.', '.#..', '####'],
  '3': ['###.', '...#', '.##.', '...#', '###.'],
  '4': ['#..#', '#..#', '####', '...#', '...#'],
  '5': ['####', '#...', '###.', '...#', '###.'],
  '6': ['.##.', '#...', '###.', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '.##.'],
  '9': ['.##.', '#..#', '.###', '...#', '.##.'],
};

export type CreditDigit = {
  digit: string;
  // Row-major, one entry per cell of the 4 x 5 grid.
  cells: boolean[];
};

// Whole non-negative credit amounts only; anything else would show garbage on a jukebox.
export function creditDigits(value: number): CreditDigit[] {
  const text = String(Math.max(0, Math.trunc(value)));
  return [...text].map((digit) => ({
    digit,
    cells: (DIGIT_BITMAPS[digit] ?? [])
      .join('')
      .split('')
      .map((cell) => cell === FILLED_PIXEL),
  }));
}
