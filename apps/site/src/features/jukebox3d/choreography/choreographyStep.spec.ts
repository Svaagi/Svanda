import { describe, expect, it } from 'vitest';

import {
  type ChoreographyInput,
  initialMotion,
  settleMotion,
  stepChoreography,
} from './choreographyStep';
import { createStageLayout } from './stageLayout';

const IDLE_POINTER = { x: 0, y: 0, isActive: false };
const INPUT: ChoreographyInput = {
  deltaS: 1 / 60,
  vp: 0,
  pointer: IDLE_POINTER,
  introPhase: 'done',
  isReducedMotion: false,
  layout: createStageLayout(
    { width: 1440, height: 900 },
    { heroTextTop: null, karaoke: null, jukebox: null },
  ),
};

describe('stepChoreography', () => {
  it('keeps drawing at full rate while the model rises', () => {
    const motion = initialMotion('swarm', false, IDLE_POINTER);

    const waiting = stepChoreography(motion, { ...INPUT, introPhase: 'swarm' });
    expect(waiting.pose.isVisible).toBe(false);
    expect(waiting.frameRequest).toBe('none');

    const started = stepChoreography(waiting.motion, {
      ...INPUT,
      introPhase: 'reveal',
    });
    const rising = stepChoreography(started.motion, INPUT);
    expect(rising.pose.isVisible).toBe(true);
    expect(rising.frameRequest).toBe('now');
  });

  it('only sways at the idle rate once risen, and stands still on Custom and Venues', () => {
    const motion = initialMotion('done', false, IDLE_POINTER);

    expect(stepChoreography(motion, INPUT).frameRequest).toBe('idle');
    expect(stepChoreography(motion, { ...INPUT, vp: 3 }).frameRequest).toBe(
      'none',
    );
    expect(stepChoreography(motion, { ...INPUT, vp: 4 }).frameRequest).toBe(
      'none',
    );
  });

  it('never animates on its own with reduced motion', () => {
    const motion = initialMotion('pixels', true, IDLE_POINTER);
    const frame = stepChoreography(motion, {
      ...INPUT,
      introPhase: 'pixels',
      isReducedMotion: true,
    });

    expect(frame.pose.isVisible).toBe(true);
    expect(frame.frameRequest).toBe('none');
  });

  it('follows a pointer over the hero until it catches up', () => {
    const motion = initialMotion('done', false, IDLE_POINTER);
    const pointer = { x: 0.5, y: 0.5, isActive: true };

    const hero = stepChoreography(motion, { ...INPUT, pointer });
    expect(hero.cursorStrength).toBe(1);
    expect(hero.frameRequest).toBe('now');

    const karaoke = stepChoreography(motion, { ...INPUT, vp: 1, pointer });
    expect(karaoke.cursorStrength).toBe(0);
    expect(karaoke.frameRequest).toBe('idle');
  });

  it('settles a running rise at once', () => {
    const rising = stepChoreography(
      initialMotion('reveal', false, IDLE_POINTER),
      {
        ...INPUT,
        introPhase: 'reveal',
      },
    ).motion;

    const settled = settleMotion(rising);

    expect(settled.rise.status).toBe('risen');
    expect(stepChoreography(settled, INPUT).riseProgress).toBe(1);
  });

  it('advances the scene clock', () => {
    const motion = initialMotion('done', false, IDLE_POINTER);

    expect(stepChoreography(motion, INPUT).motion.timeS).toBeCloseTo(1 / 60);
  });
});
