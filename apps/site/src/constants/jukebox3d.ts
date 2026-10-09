// The jukebox model, converted from the design OBJ by `pnpm --filter site model:convert`.
export const JUKEBOX_MODEL_URL = '/models/jukebox.glb';
// Rendered once from the real scene by `pnpm --filter site model:poster`.
export const JUKEBOX_POSTER_URL = '/models/jukebox-poster.webp';
export const JUKEBOX_POSTER_WIDTH_PX = 1620;
export const JUKEBOX_POSTER_HEIGHT_PX = 900;

// Mesh names from the OBJ objects: every `Display*` mesh is glass, the rest is the shell.
export const DISPLAY_MESH_PREFIX = 'Display';

// Renderer.
export const SCENE_DPR_RANGE: [number, number] = [1, 1.5];
export const SCENE_EXPOSURE = 1.15;

// Camera: a long lens far away, so the model reads almost flat.
export const CAMERA_FOV_DEG = 28;
export const CAMERA_NEAR = 50;
export const CAMERA_FAR = 8000;
export const CAMERA_HEIGHT = 40;
export const CAMERA_MIN_DISTANCE = 1560;
// The camera backs off until this many world units fit across the stage width.
export const CAMERA_FIT_WIDTH_LANDSCAPE = 700;
export const CAMERA_FIT_WIDTH_PORTRAIT = 300;

// Model space bounds of the converted OBJ (centred on its origin) and its main display rect.
export const MODEL_BOUNDS = {
  minX: -122,
  maxX: 122,
  minY: -241.6,
  maxY: 241.6,
  minZ: -45.2,
  maxZ: 45.2,
} as const;
export const MODEL_DISPLAY_RECT = {
  minX: -101.5,
  maxX: 99,
  minY: -120.5,
  maxY: 226.3,
} as const;
// The chin panel under the display, in the same model space.
export const MODEL_CHIN_RECT = {
  minX: -34.6,
  maxX: 34.2,
  minY: -203.7,
  maxY: -133.7,
} as const;
// Both panels lie on the glass at this depth; the screen planes float a little in front so
// they do not z-fight with it, helped by a polygon offset.
export const MODEL_SCREEN_Z = 44.9;
export const SCREEN_PLANE_LIFT = 1;
export const SCREEN_FACE_Z = MODEL_SCREEN_Z + SCREEN_PLANE_LIFT;
export const SCREEN_POLYGON_OFFSET = -4;

// The display face sits nearer the camera than z = 0, so it projects a little larger.
export const MODEL_DEPTH_PAD = 1.06;

// Choreography, one value per stage page (hero, karaoke, jukebox, custom, venues). Positions
// are world units at the origin plane, yaw in radians.
export const PAGE_YAW: readonly number[] = [-0.45, -0.45, 0.45, 0, 0];
// Full turns while `vp` crosses from page k to k + 1: hero to karaoke and jukebox to custom.
export const PAGE_SPIN_TURNS: readonly number[] = [1, 0, 1, 0];
export const PAGE_SCALE_LANDSCAPE: readonly number[] = [
  1.3, 1.5, 1.5, 1.43, 1.3,
];
export const PAGE_SCALE_PORTRAIT: readonly number[] = [
  1.35, 1.3, 1.3, 0.8, 0.8,
];
// Portrait karaoke and jukebox before the page copy is measured.
export const PRODUCT_Y_PORTRAIT = 20;
// Venues: the model has sunk out of view.
export const VENUES_Y_LANDSCAPE = -1100;
export const VENUES_Y_PORTRAIT = -1400;

// Models centre this far below the stage centre (the header takes the top).
export const MODEL_BELOW_NAV_OFFSET_PX = 32;
// Portrait: the header height the hero model centres below.
export const NAV_HEIGHT_PX = 64;
// Portrait: a measured gap smaller than this keeps the default position.
export const HERO_TEXT_MIN_TOP_PX = 120;
export const PRODUCT_SLOT_MIN_HEIGHT_PX = 80;

// Landscape karaoke and jukebox: the display fills its half of the page, the cabinet runs
// off the bottom.
export const PRODUCT_X_VIEW_RATIO = 0.25;
export const PRODUCT_DISPLAY_HEIGHT_RATIO = 0.8;
export const PRODUCT_DISPLAY_WIDTH_RATIO = 0.36;
export const PRODUCT_SCALE_BOOST = 1.15;

// Custom: the whole model on screen with room for the configurator switches above the display.
export type CustomFitMargins = {
  // Vertical px kept free around the whole model, and around the model below the display top.
  model: number;
  display: number;
  // Free px under the model, and above its top and its display top.
  bottom: number;
  top: number;
  displayTop: number;
};
export const CUSTOM_MAX_SCALE = 1.43;
export const CUSTOM_FIT_LANDSCAPE: CustomFitMargins = {
  model: 96,
  display: 164,
  bottom: 16,
  top: 80,
  displayTop: 148,
};
export const CUSTOM_FIT_PORTRAIT: CustomFitMargins = {
  model: 160,
  display: 228,
  bottom: 80,
  top: 80,
  displayTop: 148,
};

// Motion. Times in seconds of the scene clock, angles in radians.
// Rise from below once the intro reveals the page: easeOutBack with this overshoot.
export const RISE_DURATION_S = 1.3;
export const RISE_OVERSHOOT = 1.2;
export const RISE_START_Y = -900;
export const RISE_START_SCALE = 0.85;
export const RISE_START_TILT = 0.35;
export const RISE_SPIN_IN_YAW = 1.4;
// The rest pose leans a little towards the visitor; Custom (calm) stands face-on.
export const REST_TILT_X = 0.12;
export const REST_ROLL_Z = 0.03;
export const CALM_FADE_RATE = 2;
export const SWAY_RATE = 0.9;
export const SWAY_AMPLITUDE = 0.06;
// One scene frame advances the clock by at most this, so a stall does not skip the rise.
export const MAX_FRAME_DELTA_S = 0.1;
// While only the idle sway moves, the scene redraws at about 30 fps.
export const IDLE_FRAME_MS = 33;

// Cursor parallax and lights follow a smoothed pointer: this share of the gap closes per
// frame at the reference frame rate.
export const POINTER_SMOOTHING = 0.12;
export const POINTER_SMOOTHING_FPS = 60;
export const POINTER_SETTLED_EPSILON = 0.001;
export const PARALLAX_TILT_X = 0.06;
export const PARALLAX_YAW = 0.12;
// Pointer -1..1 to light position in world units.
export const CURSOR_LIGHT_SPAN_X = 520;
export const CURSOR_LIGHT_SPAN_Y = 330;
export const CURSOR_LIGHT_OFFSET_Y = 20;

export type CursorLightSpec = {
  z: number;
  // Prototype (legacy units) intensity, range and decay.
  legacyIntensity: number;
  distance: number;
  decay: number;
  // Distance to the model face where the physical light matches the legacy one.
  referenceDistance: number;
};
export const CURSOR_LIGHTS: Record<'key' | 'tint', CursorLightSpec> = {
  key: {
    z: 330,
    legacyIntensity: 2.6,
    distance: 1400,
    decay: 1.6,
    referenceDistance: 270,
  },
  tint: {
    z: 260,
    legacyIntensity: 0.7,
    distance: 900,
    decay: 2,
    referenceDistance: 200,
  },
};

// Floor shadow: the base footprint plus a copy pushed along the ground by a light from the
// upper left (135 degrees), as a share of the footprint's screen width.
export const SHADOW_OFFSET_RATIO = 0.16;
export const SHADOW_DEPTH_RATIO = 0.7;
// Published shadow points are rounded to this many decimals, and only sent when they change.
export const SHADOW_DECIMALS = 1;

export type JukeboxMaterialSpec = {
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
};

export const SHELL_MATERIAL: JukeboxMaterialSpec = {
  metalness: 0.25,
  roughness: 0.45,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  envMapIntensity: 0.55,
};

export const GLASS_MATERIAL: JukeboxMaterialSpec = {
  metalness: 0.7,
  roughness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0,
  envMapIntensity: 1.2,
};

// Colour tokens the scene reads (theme.css). Their hex values are taken as linear values,
// like the prototype's pre colour management three.js did.
export const JUKEBOX_COLOR_VARS = {
  shell: '--color-jukebox-shell',
  glass: '--color-jukebox-glass',
  softboxBackground: '--color-jukebox-softbox-bg',
  softbox: '--color-jukebox-softbox',
  softboxLeft: '--color-jukebox-softbox-left',
  softboxRight: '--color-jukebox-softbox-right',
  sky: '--color-jukebox-sky',
  ground: '--color-jukebox-ground',
  key: '--color-jukebox-key',
  rimLeft: '--color-jukebox-rim-left',
  rimRight: '--color-jukebox-rim-right',
  fill: '--color-jukebox-fill',
  cursor: '--color-jukebox-cursor',
} as const;

export type JukeboxColorName = keyof typeof JUKEBOX_COLOR_VARS;

// The prototype's light intensities were legacy (non physical) units; physically based
// lights need them times pi for the same irradiance.
const LEGACY_TO_PHYSICAL = Math.PI;

export const HEMISPHERE_INTENSITY = 0.15 * LEGACY_TO_PHYSICAL;

export type DirectionalLightSpec = {
  color: JukeboxColorName;
  intensity: number;
  position: [number, number, number];
};

export const DIRECTIONAL_LIGHTS: Record<string, DirectionalLightSpec> = {
  key: {
    color: 'key',
    intensity: 0.55 * LEGACY_TO_PHYSICAL,
    position: [400, 700, 600],
  },
  rimLeft: {
    color: 'rimLeft',
    intensity: 0.7 * LEGACY_TO_PHYSICAL,
    position: [-700, 250, -200],
  },
  rimRight: {
    color: 'rimRight',
    intensity: 0.5 * LEGACY_TO_PHYSICAL,
    position: [700, -150, -300],
  },
  fill: {
    color: 'fill',
    intensity: 0.12 * LEGACY_TO_PHYSICAL,
    position: [-300, -400, 500],
  },
};

// The softbox environment: emissive panels around the model, baked once into an env map.
export type SoftboxPanelSpec = {
  id: string;
  color: JukeboxColorName;
  intensity: number;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
};

const QUARTER_TURN = Math.PI / 2;
const FLOOR_PANEL_TILT = -Math.PI / 2.4;

export const SOFTBOX_PANELS: readonly SoftboxPanelSpec[] = [
  {
    id: 'overhead',
    color: 'softbox',
    intensity: 3.2,
    scale: [30, 12, 1],
    position: [0, 14, 4],
    rotation: [QUARTER_TURN, 0, 0],
  },
  {
    id: 'left',
    color: 'softboxLeft',
    intensity: 1.1,
    scale: [10, 24, 1],
    position: [-16, 2, 0],
    rotation: [0, QUARTER_TURN, 0],
  },
  {
    id: 'right',
    color: 'softboxRight',
    intensity: 0.9,
    scale: [10, 24, 1],
    position: [16, 2, 0],
    rotation: [0, -QUARTER_TURN, 0],
  },
  {
    id: 'floor',
    color: 'softbox',
    intensity: 0.8,
    scale: [40, 6, 1],
    position: [0, -10, 10],
    rotation: [FLOOR_PANEL_TILT, 0, 0],
  },
  {
    id: 'back',
    color: 'softbox',
    intensity: 2.2,
    scale: [14, 8, 1],
    position: [0, 6, -18],
    rotation: [0, 0, 0],
  },
];
export const SOFTBOX_RESOLUTION = 256;

// Screen textures: canvas sizes in px, the display stretched onto its plane.
export const SCREEN_TEXTURE_WIDTH_PX = 380;
export const SCREEN_TEXTURE_HEIGHT_PX = 657;
export const CHIN_TEXTURE_WIDTH_PX = 200;
export const CHIN_TEXTURE_HEIGHT_PX = 204;

// The hero display shows the wordmark's "S" in big pixels; every cell re-rolls its colour
// about this often per second, each on its own phase, and the S fades out by this `vp`.
export const SCREEN_LOGO_CELL_PX = 30;
export const SCREEN_LOGO_CELL_INSET_PX = 2;
export const SCREEN_LOGO_STEPS_PER_S = 1.25;
export const SCREEN_LOGO_PHASE_STEPS = 4;
export const SCREEN_LOGO_PHASE_SALT = 3;
export const SCREEN_LOGO_FADE_VP = 0.6;

// The chin VU meter: a row of bars lit up to a level that wanders on two sine waves.
export const VU_BAR_COUNT = 10;
export const VU_BAR_LEFT_PX = 22;
export const VU_BAR_PITCH_PX = 16;
export const VU_BAR_TOP_PX = 91;
export const VU_BAR_WIDTH_PX = 11;
export const VU_BAR_HEIGHT_PX = 22;
export const VU_LEVEL_BASE = 5.5;
export const VU_LEVEL_WAVES: readonly { amplitude: number; rate: number }[] = [
  { amplitude: 2.5, rate: 0.9 },
  { amplitude: 1.2, rate: 1.7 },
];

// Screen colour tokens: the display is a physical panel, the same in both themes.
export const SCREEN_BACKGROUND_VAR = '--color-jukebox-screen';
export const VU_BAR_OFF_VAR = '--color-jukebox-vu-off';
export const SCREEN_LOGO_COLOR_VARS = [
  '--color-jukebox-screen-pixel-1',
  '--color-jukebox-screen-pixel-2',
  '--color-jukebox-screen-pixel-3',
  '--color-jukebox-screen-pixel-4',
  '--color-jukebox-screen-pixel-5',
  '--color-jukebox-screen-pixel-6',
] as const;
export const VU_BAR_COLOR_VARS = [
  '--color-jukebox-vu-1',
  '--color-jukebox-vu-2',
  '--color-jukebox-vu-3',
  '--color-jukebox-vu-4',
  '--color-jukebox-vu-5',
  '--color-jukebox-vu-6',
  '--color-jukebox-vu-7',
] as const;

// The display corners are published in stage px rounded to this many decimals, and only
// when they change.
export const SCREEN_QUAD_DECIMALS = 1;

// The projected display: a 540x960 DOM box warped onto the 3D display on the product pages.
export const PROJECTED_SCREEN_WIDTH_PX = 540;
export const PROJECTED_SCREEN_HEIGHT_PX = 960;
// Visible between these `vp` values, fading in and out over this much `vp` at either end.
// Visibility is rounded so the page values land on exactly 0 and 1.
export const PROJECTED_VISIBLE_FROM_VP = 0.8;
export const PROJECTED_VISIBLE_TO_VP = 2.2;
export const PROJECTED_FADE_VP = 0.2;
export const PROJECTED_VISIBILITY_DECIMALS = 4;
// Below this visibility the display takes no pointer or keyboard input.
export const PROJECTED_INTERACTIVE_VISIBILITY = 0.9;
// The karaoke page shows the sing screen, the jukebox page the listen screen.
export const PROJECTED_LISTEN_FROM_VP = 1.5;
