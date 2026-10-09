// The lava lamp behind the jukebox app UI, ported from the app's own effect. Blob paths live
// in a 0..100 space across and down the screen; the canvas maps it to its pixels.
export const LAVA_SPACE = 100;
export const LAVA_BLOB_SEED = 3141;

// One loop of a blob: rest at the bottom, rise, linger at the top, sink, rest again.
export const LAVA_KEYFRAME_TIMES: readonly number[] = [
  0, 0.07, 0.3, 0.52, 0.6, 0.82, 0.93, 1,
];

export type LavaTier = {
  count: number;
  radiusX: readonly [number, number];
  radiusY: readonly [number, number];
  durationS: readonly [number, number];
};

// Few big slow blobs, more mid ones, many small quick ones: 40 in all.
export const LAVA_TIERS: readonly LavaTier[] = [
  { count: 7, radiusX: [11, 14], radiusY: [8, 11], durationS: [80, 120] },
  { count: 13, radiusX: [7, 10], radiusY: [6, 8], durationS: [55, 80] },
  { count: 20, radiusX: [3, 6], radiusY: [3, 5], durationS: [35, 55] },
];

// Path shape, in lamp space.
export const LAVA_EDGE_MARGIN = 2;
export const LAVA_DRIFT_X = 20;
export const LAVA_FALL_JITTER_X = 12;
export const LAVA_RISE_DRIFT_RATIO = 0.55;
export const LAVA_REST_Y: readonly [number, number] = [78, 96];
export const LAVA_TOP_Y_MIN_RANGE = 20;
export const LAVA_TOP_Y_PAD = 8;
export const LAVA_RISE_Y: readonly [number, number] = [38, 58];
export const LAVA_FALL_Y: readonly [number, number] = [42, 62];

// Blob drawing: an ellipse filled with a radial gradient darkening towards its rim.
export const LAVA_BLOB_SCALE_X = 1.25;
export const LAVA_BLOB_SCALE_Y = 1.45;
export const LAVA_GRADIENT_RADIUS_RATIO = 1.64;
export const LAVA_EDGE_DARKEN_RATIO = 0.35;
export type LavaGradientStop = {
  offset: number;
  alpha: number;
  // Edge stops use the blob colour darkened by LAVA_EDGE_DARKEN_RATIO.
  isEdge: boolean;
};
export const LAVA_GRADIENT_STOPS: readonly LavaGradientStop[] = [
  { offset: 0, alpha: 0.7, isEdge: false },
  { offset: 0.52, alpha: 0.7, isEdge: false },
  { offset: 0.78, alpha: 0.7, isEdge: true },
  { offset: 1, alpha: 0.245, isEdge: true },
];

// Metaballs: blur the blobs, then sharpen the alpha so nearby blobs melt into one.
export const LAVA_BLUR_PASSES = 2;
export const LAVA_BLUR_RADIUS_RATIO = 0.035;
export const LAVA_THRESHOLD_GAIN = 60;
export const LAVA_THRESHOLD_OFFSET = 22;

// Lamp time runs at this share of real time, times the configured speed.
export const LAVA_TIME_SCALE = 0.6;

// Pixel design: a few dozen blocks across, upscaled without smoothing, colours posterized.
export const LAVA_PIXEL_MIN_COLUMNS = 10;
export const LAVA_POSTERIZE_STEP = 20;
export const LAVA_PIXEL_FPS = 12;

// Glass design: a fixed small canvas the CSS blur hides.
export const LAVA_GLASS_COLUMNS = 90;
export const LAVA_GLASS_ROWS = 160;
export const LAVA_GLASS_FPS = 24;

// Glitch tearing: a short burst of shifted rows every few seconds.
export const LAVA_GLITCH_FIRST_MS = 2500;
export const LAVA_GLITCH_DURATION_MS: readonly [number, number] = [220, 400];
export const LAVA_GLITCH_GAP_MS: readonly [number, number] = [2200, 5700];
export const LAVA_GLITCH_ROWS = 5;
// A lamp that stands still shows a fixed tear, the same on every visit.
export const LAVA_STATIC_GLITCH_ROWS = 3;
export const LAVA_STATIC_GLITCH_SEED = 7;
export const LAVA_TEAR_MAX_HEIGHT = 3;
export const LAVA_TEAR_MAX_SHIFT = 4;
export const LAVA_TEAR_STRIP_CHANCE = 0.5;
export const LAVA_TEAR_STRIP_ALPHA = 0.28;

// After a pause (hidden tab, scrolled away) the lamp moves on by at most this much, so it
// never jumps.
export const LAVA_MAX_STEP_MS = 100;
