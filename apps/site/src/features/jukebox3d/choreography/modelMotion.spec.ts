import { describe, expect, it } from 'vitest';

import {
  advanceRise,
  calmAt,
  heroPresence,
  initialRise,
  modelPose,
  type ModelPoseInput,
  riseProgress,
  swayAt,
} from './modelMotion';

const PAGE = { x: 10, y: -30, yaw: -0.45, scale: 1.3, spin: Math.PI };
const RESTING: ModelPoseInput = {
  page: PAGE,
  riseProgress: 1,
  timeS: 0,
  calm: 0,
  parallax: { tiltX: 0, yaw: 0 },
  isReducedMotion: false,
};

describe('rise', () => {
  it('shows a model that loads after the intro has ended at rest, like the prototype', () => {
    const rise = initialRise('done', false);

    expect(rise.status).toBe('risen');
    expect(riseProgress(advanceRise(rise, 'done', 0.1))).toBe(1);
  });

  it('skips the rise without an intro or with reduced motion', () => {
    expect(riseProgress(initialRise('done', false))).toBe(1);
    expect(riseProgress(initialRise('pixels', true))).toBe(1);
  });

  it('waits for the intro to reveal the page, then rises over 1.3 s', () => {
    let rise = initialRise('pixels', false);
    rise = advanceRise(rise, 'swarm', 0.1);
    expect(rise.status).toBe('waiting');

    rise = advanceRise(rise, 'reveal', 0.1);
    expect(rise.status).toBe('rising');
    expect(riseProgress(rise)).toBe(0);

    rise = advanceRise(rise, 'reveal', 0.65);
    expect(riseProgress(rise)).toBeCloseTo(0.5);

    rise = advanceRise(rise, 'done', 0.7);
    expect(rise.status).toBe('risen');
    expect(advanceRise(rise, 'done', 1)).toBe(rise);
  });
});

describe('calmAt', () => {
  it('is 1 on Custom and gone half a page away', () => {
    expect(calmAt(3)).toBe(1);
    expect(calmAt(2.75)).toBeCloseTo(0.5);
    expect(calmAt(2.5)).toBe(0);
    expect(calmAt(0)).toBe(0);
  });
});

describe('heroPresence', () => {
  it('fades over the first page turn', () => {
    expect(heroPresence(0)).toBe(1);
    expect(heroPresence(0.5)).toBe(0.5);
    expect(heroPresence(1)).toBe(0);
    expect(heroPresence(3)).toBe(0);
  });
});

describe('swayAt', () => {
  it('sways gently around zero', () => {
    expect(swayAt(0)).toBe(0);
    expect(Math.abs(swayAt(1.7))).toBeLessThanOrEqual(0.06);
  });
});

describe('modelPose', () => {
  it('starts 900 units below, shrunk, tilted and spun in', () => {
    const pose = modelPose({ ...RESTING, riseProgress: 0 });

    expect(pose.isVisible).toBe(false);
    expect(pose.y).toBeCloseTo(-900);
    expect(pose.scale).toBeCloseTo(0.85 * 1.3);
    expect(pose.rotationX).toBeCloseTo(0.12 + 0.35);
    expect(pose.rotationY).toBeCloseTo(-0.45 + 1.4 + Math.PI);
  });

  it('rests on the page pose with the lean once risen', () => {
    const pose = modelPose(RESTING);

    expect(pose.isVisible).toBe(true);
    expect(pose.x).toBe(10);
    expect(pose.y).toBeCloseTo(-30);
    expect(pose.rotationX).toBeCloseTo(0.12);
    expect(pose.rotationY).toBeCloseTo(-0.45 + Math.PI);
    expect(pose.rotationZ).toBeCloseTo(0.03);
    expect(pose.scale).toBeCloseTo(1.3);
  });

  it('overshoots on the way up', () => {
    expect(modelPose({ ...RESTING, riseProgress: 0.8 }).y).toBeGreaterThan(-30);
  });

  it('adds sway and cursor tilt, but stands still and face-on when calm', () => {
    const input = {
      ...RESTING,
      timeS: 1.7,
      parallax: { tiltX: 0.03, yaw: 0.05 },
    };
    const moving = modelPose(input);
    const calm = modelPose({ ...input, calm: 1 });

    expect(moving.rotationX).toBeCloseTo(0.15);
    expect(moving.rotationY).toBeCloseTo(-0.45 + Math.PI + swayAt(1.7) + 0.05);
    expect(calm.rotationX).toBe(0);
    expect(calm.rotationZ).toBe(0);
    expect(calm.rotationY).toBeCloseTo(-0.45 + Math.PI);
  });

  it('drops sway, spins and cursor tilt with reduced motion', () => {
    const pose = modelPose({
      ...RESTING,
      timeS: 1.7,
      parallax: { tiltX: 0.03, yaw: 0.05 },
      isReducedMotion: true,
    });

    expect(pose.rotationX).toBeCloseTo(0.12);
    expect(pose.rotationY).toBeCloseTo(-0.45);
  });
});
