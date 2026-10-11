const DO_NOT_TRACK_VALUES = new Set(['1', 'yes']);

// True when the browser sends Do Not Track ('yes' is what old Firefox reported).
export function isDoNotTrack({
  doNotTrack,
}: Pick<Navigator, 'doNotTrack'>): boolean {
  return doNotTrack !== null && DO_NOT_TRACK_VALUES.has(doNotTrack);
}
