import type { FrameRequest } from '../choreography';

export type FrameScheduler = {
  request: (request: FrameRequest) => void;
  cancel: () => void;
};

// Turns the choreography's frame requests into demand frameloop invalidations: at once while
// something moves, on a timer (one at a time) while only the idle sway does.
export function createFrameScheduler(
  invalidate: () => void,
  idleFrameMs: number,
): FrameScheduler {
  let idleTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    request: (request) => {
      if (request === 'now') {
        invalidate();
      } else if (request === 'idle' && idleTimer === undefined) {
        idleTimer = setTimeout(() => {
          idleTimer = undefined;
          invalidate();
        }, idleFrameMs);
      }
    },
    cancel: () => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
    },
  };
}
