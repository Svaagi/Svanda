import { INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE } from 'constants/intro';
import { STAGE_PAGE_IDS } from 'constants/stage';
import { readSessionStorage, writeSessionStorage } from 'utils';

export type IntroMode = 'play' | 'skip';

type IntroModeInput = {
  hasSeenIntro: boolean;
  isReducedMotion: boolean;
  // `location.hash`: a deep link below the stage would leave the intro playing off screen.
  hash: string;
};

const STAGE_HASHES = new Set(STAGE_PAGE_IDS.map((pageId) => `#${pageId}`));

export function isOutsideStageHash(hash: string): boolean {
  return hash !== '' && hash !== '#' && !STAGE_HASHES.has(hash);
}

// Once per browser session, never for visitors who asked for reduced motion and never for a
// deep link past the stage: those land on the final state straight away.
// public/intro-init.js mirrors this before first paint.
export function resolveIntroMode({
  hasSeenIntro,
  isReducedMotion,
  hash,
}: IntroModeInput): IntroMode {
  return hasSeenIntro || isReducedMotion || isOutsideStageHash(hash)
    ? 'skip'
    : 'play';
}

export function hasSeenIntro(): boolean {
  return readSessionStorage(INTRO_SEEN_STORAGE_KEY) !== null;
}

export function markIntroSeen(): void {
  writeSessionStorage(INTRO_SEEN_STORAGE_KEY, INTRO_SEEN_VALUE);
}
