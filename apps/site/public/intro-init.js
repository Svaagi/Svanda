// Runs blocking in <head> before first paint: when the intro is going to play, it marks
// <html> so CSS covers the stage and holds the header back until the app takes over, with no
// flash of the final page first. Mirrors resolveIntroMode (src/features/intro/introMode.ts);
// the key, attribute, value, query and stage ids must match src/constants
// (introInitScript.spec.ts).
(function () {
  const stageHashes = ['#top', '#karaoke', '#jukebox', '#custom', '#venues'];
  const hash = window.location.hash;
  const isOutsideStage =
    hash !== '' && hash !== '#' && stageHashes.indexOf(hash) === -1;
  let hasSeenIntro = false;
  try {
    hasSeenIntro = window.sessionStorage.getItem('svanda-intro-seen') !== null;
  } catch {
    hasSeenIntro = false;
  }
  const isReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasSeenIntro && !isReducedMotion && !isOutsideStage) {
    document.documentElement.setAttribute('data-intro', 'pending');
  }
})();
