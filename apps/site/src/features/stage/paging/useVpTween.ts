import { VP_CSS_PROPERTY, VP_TWEEN_DURATION_MS } from 'constants/stage';
import { useEffect } from 'react';

import { useStageStore } from '../stageStore';
import { toStagePage } from './pagingHelpers';
import { formatVp, tweenVp } from './vpTween';

// Owns the stage's rAF loop: eases `vp` toward the current page and mirrors it into `--sv-vp`.
// The loop only runs while a tween is in flight and reads no layout.
export function useVpTween(isReducedMotion: boolean) {
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    let frameId = 0;
    let fromVp = 0;
    let targetVp = toStagePage(useStageStore.getState().page);
    let startedAt = 0;
    let publishedVp = '';

    const publish = (vp: number) => {
      useStageStore.getState().setVp(vp);
      const cssVp = formatVp(vp);
      if (cssVp === publishedVp) return;
      publishedVp = cssVp;
      rootStyle.setProperty(VP_CSS_PROPERTY, cssVp);
    };

    const step = (now: number) => {
      const elapsedMs = now - startedAt;
      publish(tweenVp(fromVp, targetVp, elapsedMs));
      frameId =
        elapsedMs < VP_TWEEN_DURATION_MS ? requestAnimationFrame(step) : 0;
    };

    const retarget = (page: number) => {
      const nextTargetVp = toStagePage(page);
      if (nextTargetVp === targetVp) return;
      targetVp = nextTargetVp;
      if (isReducedMotion) {
        publish(targetVp);
        return;
      }
      fromVp = useStageStore.getState().vp;
      startedAt = performance.now();
      if (!frameId) frameId = requestAnimationFrame(step);
    };

    // Mounting lands directly on the current page, so a deep link does not fly through the stage.
    publish(targetVp);
    const unsubscribe = useStageStore.subscribe((state, previous) => {
      if (state.page !== previous.page) retarget(state.page);
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(frameId);
      rootStyle.removeProperty(VP_CSS_PROPERTY);
    };
  }, [isReducedMotion]);
}
