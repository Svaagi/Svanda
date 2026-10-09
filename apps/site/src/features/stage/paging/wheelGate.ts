import {
  CONTACT_PAGE,
  WHEEL_SILENCE_MS,
  WHEEL_TURN_INTERVAL_MS,
} from 'constants/stage';
import { clamp } from 'lib/math';

import { isNativeContactScroll, resolveScrollPage } from './pagingHelpers';

export type WheelGate = {
  lastWheelAt: number;
  lastTurnAt: number;
};

export const INITIAL_WHEEL_GATE: WheelGate = {
  lastWheelAt: Number.NEGATIVE_INFINITY,
  lastTurnAt: Number.NEGATIVE_INFINITY,
};

export type WheelInput = {
  deltaY: number;
  scrollY: number;
  pageHeight: number;
  now: number;
  isReady: boolean;
};

// `native` lets the browser scroll, `hold` swallows the event, `turn` moves one page.
export type WheelDecision =
  { kind: 'native' } | { kind: 'hold' } | { kind: 'turn'; page: number };

type WheelResult = {
  decision: WheelDecision;
  gate: WheelGate;
};

export function decideWheel(input: WheelInput, gate: WheelGate): WheelResult {
  if (!input.isReady) return { decision: { kind: 'hold' }, gate };

  const { deltaY, scrollY, pageHeight, now } = input;
  // Every event counts as gesture activity, including tiny inertia ticks.
  const isFreshGesture = now - gate.lastWheelAt >= WHEEL_SILENCE_MS;
  const wheelGate = { ...gate, lastWheelAt: now };
  const direction = Math.sign(deltaY);

  if (!direction || isNativeContactScroll(scrollY, pageHeight, direction)) {
    return { decision: { kind: 'native' }, gate: wheelGate };
  }
  if (!isFreshGesture || now - gate.lastTurnAt < WHEEL_TURN_INTERVAL_MS) {
    return { decision: { kind: 'hold' }, gate: wheelGate };
  }

  const turnedGate = { ...wheelGate, lastTurnAt: now };
  const currentPage = resolveScrollPage(scrollY, pageHeight);
  const page = clamp(currentPage + direction, 0, CONTACT_PAGE);
  if (page === currentPage) {
    return { decision: { kind: 'hold' }, gate: turnedGate };
  }
  return { decision: { kind: 'turn', page }, gate: turnedGate };
}
