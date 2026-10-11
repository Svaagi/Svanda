import { describe, expect, it } from 'vitest';

import { decideWheel, INITIAL_WHEEL_GATE, type WheelInput } from './wheelGate';

const PAGE_HEIGHT = 800;

const wheel = (overrides: Partial<WheelInput> = {}): WheelInput => ({
  deltaY: 100,
  scrollY: 0,
  pageHeight: PAGE_HEIGHT,
  now: 10_000,
  isReady: true,
  ...overrides,
});

describe('decideWheel', () => {
  it('turns one page on a fresh gesture', () => {
    const { decision, gate } = decideWheel(wheel(), INITIAL_WHEEL_GATE);

    expect(decision).toEqual({ kind: 'turn', page: 1 });
    expect(gate).toEqual({ lastWheelAt: 10_000, lastTurnAt: 10_000 });
  });

  it('turns back up', () => {
    const { decision } = decideWheel(
      wheel({ deltaY: -40, scrollY: 2 * PAGE_HEIGHT }),
      INITIAL_WHEEL_GATE,
    );

    expect(decision).toEqual({ kind: 'turn', page: 1 });
  });

  it('holds every event until the stage is ready', () => {
    const result = decideWheel(wheel({ isReady: false }), INITIAL_WHEEL_GATE);

    expect(result.decision).toEqual({ kind: 'hold' });
    expect(result.gate).toBe(INITIAL_WHEEL_GATE);
  });

  it('holds the rest of a gesture that is still wheeling', () => {
    const first = decideWheel(wheel(), INITIAL_WHEEL_GATE);
    const inertia = decideWheel(wheel({ now: 10_100 }), first.gate);
    const lateInertia = decideWheel(wheel({ now: 10_400 }), inertia.gate);

    expect(inertia.decision).toEqual({ kind: 'hold' });
    expect(lateInertia.decision).toEqual({ kind: 'hold' });
  });

  it('needs the turn interval even after a silence', () => {
    const first = decideWheel(wheel(), INITIAL_WHEEL_GATE);
    const tooSoon = decideWheel(
      wheel({ now: 11_000, scrollY: PAGE_HEIGHT }),
      first.gate,
    );
    const afterSilence = decideWheel(
      wheel({ now: 11_600, scrollY: PAGE_HEIGHT }),
      tooSoon.gate,
    );

    expect(tooSoon.decision).toEqual({ kind: 'hold' });
    expect(afterSilence.decision).toEqual({ kind: 'turn', page: 2 });
  });

  it('lets horizontal wheels and the contact section scroll natively', () => {
    expect(
      decideWheel(wheel({ deltaY: 0 }), INITIAL_WHEEL_GATE).decision,
    ).toEqual({ kind: 'native' });
    expect(
      decideWheel(wheel({ scrollY: 5 * PAGE_HEIGHT }), INITIAL_WHEEL_GATE)
        .decision,
    ).toEqual({ kind: 'native' });
  });

  it('pages from the top of contact back to the last stage page', () => {
    const { decision } = decideWheel(
      wheel({ deltaY: -100, scrollY: 5 * PAGE_HEIGHT }),
      INITIAL_WHEEL_GATE,
    );

    expect(decision).toEqual({ kind: 'turn', page: 4 });
  });

  it('holds at the first page', () => {
    const { decision } = decideWheel(
      wheel({ deltaY: -100 }),
      INITIAL_WHEEL_GATE,
    );

    expect(decision).toEqual({ kind: 'hold' });
  });
});
