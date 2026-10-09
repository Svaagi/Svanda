import { useEffect } from 'react';

import { useStageStore } from '../stageStore';
import { isInsideDialog } from './pagingHelpers';
import { decideWheel, INITIAL_WHEEL_GATE } from './wheelGate';

export function useWheelPaging(goToPage: (page: number) => void) {
  useEffect(() => {
    let gate = INITIAL_WHEEL_GATE;

    const handleWheel = (event: WheelEvent) => {
      // A trackpad pinch arrives as a ctrl wheel: that is zoom, not paging.
      if (event.ctrlKey || event.defaultPrevented) return;
      if (isInsideDialog(event.target)) return;
      const { isReady, viewport } = useStageStore.getState();
      const result = decideWheel(
        {
          deltaY: event.deltaY,
          scrollY: window.scrollY,
          pageHeight: viewport.height,
          now: performance.now(),
          isReady,
        },
        gate,
      );
      gate = result.gate;
      if (result.decision.kind === 'native') return;

      event.preventDefault();
      if (result.decision.kind === 'turn') goToPage(result.decision.page);
    };

    // Not passive: paging has to cancel the native scroll.
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [goToPage]);
}
