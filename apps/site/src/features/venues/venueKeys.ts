export type FrameKeyAction = {
  target: 'photo' | 'venue';
  step: -1 | 1;
};

// Keys on the photo frame: left and right step through the photos, up and down through the
// venues (the venue track runs vertically).
export function frameKeyAction(key: string): FrameKeyAction | null {
  switch (key) {
    case 'ArrowLeft':
      return { target: 'photo', step: -1 };
    case 'ArrowRight':
      return { target: 'photo', step: 1 };
    case 'ArrowUp':
      return { target: 'venue', step: -1 };
    case 'ArrowDown':
      return { target: 'venue', step: 1 };
    default:
      return null;
  }
}

// The tab a key moves to in a horizontal tablist of `count` tabs, wrapping at the ends; null
// for keys the tablist leaves alone (up and down page the stage).
export function tabKeyIndex(
  key: string,
  index: number,
  count: number,
): number | null {
  switch (key) {
    case 'ArrowLeft':
      return wrapIndex(index - 1, count);
    case 'ArrowRight':
      return wrapIndex(index + 1, count);
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}
