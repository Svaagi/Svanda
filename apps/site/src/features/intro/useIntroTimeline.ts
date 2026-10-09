import {
  INTRO_MAX_FRAME_MS,
  INTRO_PLAYING,
  INTRO_READY_S,
  INTRO_REVEAL_VARS,
} from 'constants/intro';
import { REDUCED_MOTION_QUERY } from 'constants/motion';
import { MS_PER_S } from 'constants/time';
import { type IntroReveal, useStageStore } from 'features/stage';
import { type RefObject, useEffect } from 'react';
import { getMediaQueryList } from 'utils';

import { hasSeenIntro, markIntroSeen, resolveIntroMode } from './introMode';
import { createRevealVarWriter, setIntroAttribute } from './introRoot';
import { createIntroScene } from './introScene';
import {
  introPhaseAt,
  type IntroRevealVars,
  introVarsAt,
} from './introTimeline';

// The final state: paging unlocked, header and hero shown, cover gone.
function endIntro(root: HTMLElement) {
  setIntroAttribute(root, null);
  const { setIntroPhase, setIntroReveal, setIsReady } =
    useStageStore.getState();
  setIntroReveal(null);
  setIntroPhase('done');
  setIsReady(true);
}

const isSameReveal = (current: IntroReveal | null, next: IntroRevealVars) =>
  current !== null &&
  INTRO_REVEAL_VARS.every((name) => current[name] === next[name]);

function shouldPlayIntro() {
  return (
    resolveIntroMode({
      hasSeenIntro: hasSeenIntro(),
      isReducedMotion:
        getMediaQueryList(REDUCED_MOTION_QUERY)?.matches ?? false,
      hash: window.location.hash,
    }) === 'play'
  );
}

// The intro's one rAF loop: draws the canvas and drives the stage phase and the header and
// hero reveal variables, then hands over to the page. Time only advances on drawn frames
// (each step clamped), so the intro pauses with the rAF loop in a hidden tab and resumes
// where it stopped. The stage cannot scroll away while the intro holds the scroll lock.
export function useIntroTimeline(
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    if (!canvas || !shouldPlayIntro()) {
      endIntro(root);
      return undefined;
    }

    // Shows the canvas before it is measured.
    setIntroAttribute(root, INTRO_PLAYING);
    const scene = createIntroScene(canvas);
    if (!scene) {
      endIntro(root);
      return undefined;
    }

    const revealVars = createRevealVarWriter(root);
    let lastFrameMs = performance.now();
    let elapsedMs = 0;
    let frameId = 0;
    let isSeenMarked = false;
    let isFinished = false;

    const renderFrame = (t: number) => {
      const { navLogoSlot, introPhase, introReveal, setIntroPhase } =
        useStageStore.getState();
      scene.draw(t, navLogoSlot);
      const vars = introVarsAt(t);
      revealVars.write(vars);
      if (!isSameReveal(introReveal, vars)) {
        useStageStore.getState().setIntroReveal(vars);
      }
      const phase = introPhaseAt(t);
      if (phase !== introPhase) setIntroPhase(phase);
    };

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      cancelAnimationFrame(frameId);
      scene.dispose();
      revealVars.clear();
      endIntro(root);
    };

    const tick = () => {
      // Marked on the first visible frame rather than on mount: StrictMode mounts, unmounts
      // and mounts again, and the second mount must still play; a tab opened in the
      // background has not shown the intro yet.
      if (!isSeenMarked && document.visibilityState === 'visible') {
        markIntroSeen();
        isSeenMarked = true;
      }
      const nowMs = performance.now();
      elapsedMs += Math.min(nowMs - lastFrameMs, INTRO_MAX_FRAME_MS);
      lastFrameMs = nowMs;
      const t = elapsedMs / MS_PER_S;
      if (t >= INTRO_READY_S) {
        finish();
        return;
      }
      renderFrame(t);
      frameId = requestAnimationFrame(tick);
    };

    useStageStore.getState().setIsReady(false);
    renderFrame(0);
    frameId = requestAnimationFrame(tick);
    return finish;
  }, [canvasRef]);
}
